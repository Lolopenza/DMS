# Backend Architecture Guide

Этот документ задает фундамент для удобной и предсказуемой разработки backend.

## Цели структуры
- feature-first организация кода (auth, user, lesson, problem, ...).
- минимальная связность между feature-пакетами.
- общие технические компоненты в common/infrastructure.
- явная конфигурация через typed properties.

## Рекомендуемая структура пакетов
- `com.dmc.<feature>.controller` - REST API слой.
- `com.dmc.<feature>.service` - бизнес-логика и orchestration.
- `com.dmc.<feature>.repository` - доступ к данным.
- `com.dmc.<feature>.entity` - JPA сущности.
- `com.dmc.<feature>.dto` - входные/выходные модели API.
- `com.dmc.<feature>.config` - feature-specific конфигурация.
- `com.dmc.common.*` - cross-cutting компоненты (exceptions, security, base abstractions).
- `com.dmc.infrastructure.*` - интеграции с внешними сервисами.

## Правила для нового feature-модуля
1. Создавать feature-папку с подкаталогами только когда реально добавляется код.
2. Контроллер не содержит бизнес-логики: только валидация/маршрутизация/HTTP-ответ.
3. Все пороговые значения и policy-параметры выносить в `@ConfigurationProperties`.
4. Не использовать magic numbers и literal-строки для policy.
5. Слой service должен быть unit-тестируемым без web-контекста.
6. Интеграционные тесты с Testcontainers должны иметь безопасный fallback при отсутствии Docker в локальной среде.

## Конфигурация
- В приложении включен `@ConfigurationPropertiesScan`.
- Новые typed properties классы добавляются в соответствующий feature package (`auth/config`, `billing/config`, ...).
- Критичные параметры (ttl, lockout, threshold, домены cookie) задаются через env-overrides.

## Тестовая структура
- `src/test/java/com/dmc/<feature>` - unit/integration тесты feature.
- `src/test/java/com/dmc/support` - общая тестовая инфраструктура.
- Именование тестов:
  - unit: `<ClassName>UnitTest`
  - integration: `<FlowOrController>IntegrationTest`

## Что уже улучшено
1. Auth policy переведена на typed properties (`app.auth.*`).
2. Убраны magic numbers в auth-сервисе для lockout/reset policy.
3. Для конфигураций используется auto-scan (`@ConfigurationPropertiesScan`).
4. CORS policy переведена в typed properties (`app.security.cors.*`) без hardcoded значений в Java.

## Ближайшие шаги (без поломки текущей архитектуры)
1. Добавить `@Validated` и constraints для остальных properties-классов.
2. Вынести CORS allowlist в конфигурацию и профили окружений.
3. Добавить package-level README в ключевые feature-модули по мере роста кода.
4. Ввести архитектурные тесты на границы слоев (например, ArchUnit).
