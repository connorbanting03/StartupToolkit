import importlib
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

import backend.config as config


def _reload_config(monkeypatch, **env):
    for k, v in env.items():
        monkeypatch.setenv(k, v)
    return importlib.reload(config)


def test_affiliate_defaults_preserved(monkeypatch):
    monkeypatch.delenv("AFFILIATE_SHOPIFY", raising=False)
    cfg = _reload_config(monkeypatch)
    assert cfg.AFFILIATE_LINKS["shopify"].startswith("https://")
    assert cfg.AFFILIATE_LINKS["square"] == ""


def test_affiliate_env_override(monkeypatch):
    cfg = _reload_config(monkeypatch, AFFILIATE_SQUARE="https://example.com/sq")
    assert cfg.AFFILIATE_LINKS["square"] == "https://example.com/sq"
    monkeypatch.delenv("AFFILIATE_SQUARE")
    importlib.reload(config)


@pytest.fixture
def client(monkeypatch):
    import backend.routers.ai as ai
    import backend.main as main
    from backend.dependencies import get_current_user_id

    ai._usage.clear()
    main.app.dependency_overrides[get_current_user_id] = lambda: "user-1"
    yield TestClient(main.app), ai
    main.app.dependency_overrides.clear()


def test_status_reflects_key(client, monkeypatch):
    c, ai = client
    monkeypatch.setattr(ai, "ANTHROPIC_API_KEY", "")
    assert c.get("/api/ai/status").json()["enabled"] is False
    monkeypatch.setattr(ai, "ANTHROPIC_API_KEY", "sk-test")
    assert c.get("/api/ai/status").json()["enabled"] is True


def test_autofill_requires_auth():
    import backend.main as main
    main.app.dependency_overrides.clear()
    r = TestClient(main.app).post("/api/ai/autofill", json={"prompt": "hi"})
    assert r.status_code == 401


def test_autofill_disabled_without_key(client, monkeypatch):
    c, ai = client
    monkeypatch.setattr(ai, "ANTHROPIC_API_KEY", "")
    assert c.post("/api/ai/autofill", json={"prompt": "hi"}).status_code == 503


def test_autofill_rejects_oversized_prompt(client, monkeypatch):
    c, ai = client
    monkeypatch.setattr(ai, "ANTHROPIC_API_KEY", "sk-test")
    assert c.post("/api/ai/autofill", json={"prompt": "x" * 6001}).status_code == 422


class _FakeClient:
    def __init__(self, **kw):
        self.messages = SimpleNamespace(create=self._create)

    async def _create(self, **kw):
        assert kw["messages"][0]["content"] == "price this"
        return SimpleNamespace(content=[SimpleNamespace(type="text", text="cost_per_unit: 12.50 ")])


def test_autofill_success_and_daily_limit(client, monkeypatch):
    c, ai = client
    monkeypatch.setattr(ai, "ANTHROPIC_API_KEY", "sk-test")
    monkeypatch.setattr(ai, "AI_DAILY_LIMIT", 2)
    monkeypatch.setattr(ai.anthropic, "AsyncAnthropic", _FakeClient)

    r = c.post("/api/ai/autofill", json={"prompt": "price this"})
    assert r.status_code == 200
    assert r.json() == {"text": "cost_per_unit: 12.50", "remaining_today": 1}
    assert c.post("/api/ai/autofill", json={"prompt": "price this"}).json()["remaining_today"] == 0
    assert c.post("/api/ai/autofill", json={"prompt": "price this"}).status_code == 429
