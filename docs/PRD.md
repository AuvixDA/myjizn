# LifeOS — MASTER PRD FOR CLAUDE CODE (v2)

> Ревизия исходного ТЗ: исправлен порядок слоёв FSD, добавлены типизированные
> модели данных, контракт Event Bus, стратегия поиска, backup-миграции и
> явное решение по AI Insight (см. пометки **[v2]**). Основные принципы
> исходного документа не нарушены.

## ROLE
Ты выступаешь как Senior Staff Software Engineer, Product Designer и
Solution Architect. Твоя задача — разработать приложение LifeOS строго по
этому документу. Не упрощай архитектуру. Если чего-то не хватает — предложи
решение, соответствующее общей концепции.

## PRODUCT
LifeOS — офлайн PWA на GitHub Pages. Все данные локально. Никаких серверов.
Никаких аккаунтов. Главный принцип: **Everything Connected**.

**[v2] AI Insight** — работает только на локальных эвристиках/статистике над
данными пользователя (без вызовов внешних LLM API), чтобы не нарушать принцип
"никаких серверов". Если в будущем потребуется реальный LLM-инсайт — это
явный opt-in фичефлаг с отдельным пользовательским согласием на сетевой
запрос, вне MVP.

## STACK
- React + Vite + TypeScript
- PWA (Workbox / `vite-plugin-pwa`)
- IndexedDB (Dexie)
- Zustand
- React Query
- Framer Motion
- TailwindCSS
- **[v2]** FlexSearch (in-memory полнотекстовый индекс поверх Dexie)
- **[v2]** Zod (runtime-валидация сущностей на границе backup import/export)
- **[v2]** Vitest + Testing Library (unit), Playwright (smoke e2e)

## ARCHITECTURE
Feature-Sliced Design. **[v2]** Порядок слоёв исправлен на канонический
(сверху вниз — от специфичного к общему; нижние слои не знают о верхних):

```
src/
  app/          # инициализация: провайдеры, роутинг, PWA service worker
  pages/        # композиция widgets/features под конкретный экран
  widgets/      # самостоятельные UI-блоки (HomeSummary, WeekProgress)
  features/     # пользовательские действия (create-task, check-habit)
  entities/     # бизнес-сущности: модель + минимальный UI карточки
  shared/       # переиспользуемое: ui-kit, lib, types, config, api-слой Dexie
```

Слои `services/` и `stores/` из исходного ТЗ убраны как отдельные корневые
папки — они не являются FSD-слоями. Их содержимое распределяется так:
- Dexie-инстанс и обёртки над IndexedDB → `shared/api/db`
- Event Bus → `shared/lib/event-bus`
- Zustand-сторы конкретной сущности → `entities/<entity>/model/store.ts`
- Zustand-сторы конкретной фичи → `features/<feature>/model/store.ts`
- Глобальный UI-стор (например, тема, модалки) → `shared/model`

## DATA MODEL

### Базовые типы
```ts
// shared/types/entity.ts
export type EntityId = string; // uuid v4

export interface BaseEntity {
  id: EntityId;
  createdAt: number; // unix ms
  updatedAt: number;
  relations: Relation[];
}

export type RelationType =
  | 'blocks'        // task blocks task
  | 'supports'       // task supports goal
  | 'relates-to'      // generic weak link
  | 'derived-from'     // diary entry derived from task/habit
  | 'tracks'         // finance entry tracks goal/project
  | 'part-of';        // task/note part of project

export interface Relation {
  targetId: EntityId;
  targetType: EntityKind;
  type: RelationType;
}

export type EntityKind =
  | 'goal' | 'task' | 'habit' | 'diary'
  | 'note' | 'finance' | 'project';
```

**[v2]** Раньше `relations[]` не имели типа связи и целевого типа сущности —
это делало Life Graph нечитаемым (просто список id без семантики) и не
позволяло строить обратные связи без полного скана всех сущностей. Теперь
каждая связь типизирована, а обратный индекс (`targetId → [sourceId]`)
строится в `shared/api/db` при записи через Dexie hook `creating/updating`.

### Пример сущностей
```ts
// entities/goal/model/types.ts
export interface Goal extends BaseEntity {
  title: string;
  description?: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  targetDate?: number;
  progress: number; // 0..100, вычисляется из связанных task/habit
}

// entities/task/model/types.ts
export interface Task extends BaseEntity {
  title: string;
  notes?: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: number;
  priority: 'low' | 'medium' | 'high';
  completedAt?: number;
}
```
Аналогично описываются `Habit`, `Diary`, `Note`, `Finance`, `Project`,
`Settings` — каждая как `extends BaseEntity` со своими полями (в PRD этого не
хватало; полный набор — задача шага "Создай модели данных" при реализации
каждого модуля, схема выше — образец формата).

### Стратегия удаления связей
При удалении сущности её `id` не ищется каскадно по всей базе (дорого).
Вместо этого: soft-delete (`deletedAt` в Dexie, физическое удаление —
фоновой web worker раз в сессию), который чистит "битые" `relations` у
зависимых записей через обратный индекс.

## LIFE GRAPH
Любая сущность может ссылаться на любую другую через типизированные
`relations` (см. выше). Жёстких foreign keys на уровне Dexie нет — граф
собирается in-memory через обратный индекс при старте приложения и
инкрементально обновляется через Event Bus.

## EVENT BUS
**[v2]** Контракт событий: in-memory pub/sub (без персистентности —
источник истины — сама база Dexie, события — уведомление, а не журнал).

```ts
// shared/lib/event-bus.ts
// payloads carry only ids/primitives — never full entities — so this
// module has no dependency on entities/* and stays in `shared`.
export type LifeOSEvent =
  | { type: 'goal.created'; payload: { id: EntityId } }
  | { type: 'goal.updated'; payload: { id: EntityId } }
  | { type: 'goal.deleted'; payload: { id: EntityId } }
  | { type: 'task.created'; payload: { id: EntityId } }
  | { type: 'task.updated'; payload: { id: EntityId } }
  | { type: 'task.completed'; payload: { id: EntityId; completedAt: number } }
  // linkedGoalIds travels with the event because the task row is already
  // gone by the time this fires — unlike every other handler, consumers
  // can't re-read it from Dexie.
  | { type: 'task.deleted'; payload: { id: EntityId; linkedGoalIds: EntityId[] } }
  | { type: 'habit.created'; payload: { id: EntityId } }
  | { type: 'habit.updated'; payload: { id: EntityId } }
  | { type: 'habit.checked'; payload: { id: EntityId; date: string } }
  | { type: 'habit.deleted'; payload: { id: EntityId } }
  | { type: 'finance.created'; payload: { id: EntityId; amount: number } }
  | { type: 'finance.updated'; payload: { id: EntityId } }
  | { type: 'finance.deleted'; payload: { id: EntityId } }
  | { type: 'diary.saved'; payload: { id: EntityId } }
  | { type: 'diary.deleted'; payload: { id: EntityId } }
  | { type: 'note.created'; payload: { id: EntityId } }
  | { type: 'note.updated'; payload: { id: EntityId } }
  | { type: 'note.deleted'; payload: { id: EntityId } }
  | { type: 'project.created'; payload: { id: EntityId } }
  | { type: 'project.updated'; payload: { id: EntityId } }
  | { type: 'project.deleted'; payload: { id: EntityId } };

type Handler<T extends LifeOSEvent['type']> =
  (event: Extract<LifeOSEvent, { type: T }>) => void;

export interface EventBus {
  emit<T extends LifeOSEvent>(event: T): void;
  on<T extends LifeOSEvent['type']>(type: T, handler: Handler<T>): () => void; // returns unsubscribe
}
```
Правила:
- Событие публикуется **после** успешной записи в Dexie (не до).
- Подписчики идемпотентны — обработчик может быть вызван повторно при
  повторном рендере React (StrictMode) без побочных эффектов.
- События не переживают перезагрузку страницы — при старте состояние
  восстанавливается прямым чтением из Dexie, а не replay событий.
- Подписки, инвалидирующие React Query кэш (`initGoalEventsSync` и т.п.),
  регистрируются **один раз при старте приложения**, а не хуком внутри
  компонента страницы. Ранняя версия вешала `eventBus.on` в `useEffect` при
  монтировании страницы — если событие (например, пересчёт прогресса цели
  после выполнения задачи) происходило, пока эта страница не была открыта,
  инвалидация кэша просто не срабатывала, и при следующем визите
  показывались устаревшие данные, хотя в Dexie уже было верное значение.



## USER SCENARIOS **[новый раздел, шаг 4 инструкции]**

**US-1. Создание цели и декомпозиция на задачи**
Пользователь на Home нажимает "Новая цель" → вводит title/targetDate →
`goal.created` → открывает карточку цели → добавляет несколько Task с
relation `supports → goal`. Прогресс цели (`Goal.progress`) пересчитывается
из доли `done` задач среди связанных при каждом `task.completed`.

**US-2. Выполнение задачи дня**
На Home в блоке "Задачи на сегодня" (task.dueDate === today) пользователь
отмечает чекбокс → `task.completed` эмитится → Home-виджет цели и
"прогресс недели" реагируют на событие и обновляют React Query кэш без
перезагрузки страницы.

**US-3. Глобальный поиск**
Пользователь вводит запрос в Search → FlexSearch-индекс (worker) отдаёт
id совпавших сущностей всех типов → UI резолвит их из Dexie и рендерит
сгруппированно по `EntityKind` с переходом в соответствующую карточку.

**US-4. Резервное копирование**
В Settings пользователь нажимает "Экспорт" → приложение собирает все
сущности + `backupVersion: CURRENT_BACKUP_VERSION` в один JSON → скачивание
файла. При "Импорт" — выбор файла → Zod-валидация → прогон через
`migrations` до текущей версии → подтверждение перезаписи → запись в Dexie.

**US-5. Заметка, связанная с целью**
Пользователь создаёт Note из карточки Goal (контекстное действие) → Note
создаётся сразу с `relations: [{ targetId: goal.id, targetType: 'goal',
type: 'relates-to' }]` → на карточке Goal появляется блок "Связанные
заметки" через обратный индекс Life Graph.

## HOME
Показывает: главную цель, задачи на сегодня, привычки, финансы, AI Insight,
прогресс недели. Каждый виджет подписывается на соответствующие события
Event Bus и переинвалидирует свой React Query кэш вместо polling.

## SEARCH
**[v2]** Прямой скан IndexedDB не индексируется и не масштабируется.
Решение: FlexSearch-индекс держится в памяти (worker), синхронизируется с
Dexie через `creating/updating/deleting` hooks. При старте приложения индекс
строится один раз из всех сущностей (в Web Worker, чтобы не блокировать UI).

## BACKUP
Экспорт/импорт одного JSON. Версионирование `backupVersion`. **[v2]** Проверка
совместимости — явная функция миграции:
```ts
// shared/api/backup/migrate.ts
type Migration = (data: unknown) => unknown;
const migrations: Record<number, Migration> = {
  1: (d) => d,          // initial
  2: (d) => migrateV1toV2(d as BackupV1),
};
```
Импорт сначала валидируется через Zod-схему нужной версии, затем прогоняется
через цепочку миграций до текущей `CURRENT_BACKUP_VERSION`.

## SECURITY / PRIVACY **[новый раздел]**
Finance и Diary — чувствительные данные. IndexedDB не шифруется по
умолчанию. MVP: без шифрования (явно зафиксировать в UI — "данные хранятся в
браузере без шифрования"). После MVP: опциональное шифрование at-rest через
Web Crypto API с passphrase пользователя для модулей Finance/Diary.

## UI
Стиль: Apple + Linear + Arc Browser. Glassmorphism. Тёмная тема. Плавные
анимации. Никакого Material Design.

## PERFORMANCE
Lazy loading. Code splitting. Virtual lists (`@tanstack/react-virtual`).
Memoization. Web Workers для: построения FlexSearch-индекса, тяжёлых
агрегаций (прогресс недели, финансовая аналитика).

## TESTING **[новый раздел]**
- Unit: Vitest + Testing Library для entities/features.
- Smoke e2e: Playwright — сценарий "создать цель → создать задачу →
  связать → отметить выполненной → проверить прогресс цели".
- Backup roundtrip тест: export → import → сравнение состояния БД.

## CODE STYLE
SOLID. DRY. KISS. Строгий TypeScript. Функциональные компоненты. Маленькие
модули. Комментарии только там, где необходимы.

## ROADMAP
MVP: Home, Goals, Tasks, Notes, Search, Backup. ✅ реализовано.
После MVP: Habits, Diary, Finance. ✅ реализовано.
Затем: Projects, AI Insights, Statistics. ✅ реализовано.

## INSTRUCTION
Перед написанием кода:
1. Спроектируй архитектуру.
2. Опиши дерево проекта.
3. Создай модели данных.
4. Опиши пользовательские сценарии.
5. Только затем приступай к реализации.

Если видишь возможность улучшить архитектуру — предложи улучшение, но не
нарушай основные принципы проекта.
