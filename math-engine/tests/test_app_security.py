import pytest

import app as app_module


def test_given_non_dev_env_and_default_internal_key_when_validating_then_fail_fast(monkeypatch):
    monkeypatch.setenv('DMC_ENV', 'production')
    monkeypatch.setattr(app_module, 'INTERNAL_API_KEY', 'change-me')

    with pytest.raises(RuntimeError):
        app_module._validate_internal_key_or_fail()


def test_given_dev_env_and_default_internal_key_when_validating_then_allows_start(monkeypatch):
    monkeypatch.setenv('DMC_ENV', 'dev')
    monkeypatch.setattr(app_module, 'INTERNAL_API_KEY', 'change-me')

    app_module._validate_internal_key_or_fail()
