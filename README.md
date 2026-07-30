# LifeOS

Офлайн PWA для управления жизнью: цели, задачи, заметки, поиск, резервное
копирование. Все данные хранятся локально в браузере (IndexedDB), без
серверов и аккаунтов. Архитектура и дизайн описаны в [docs/PRD.md](docs/PRD.md).

## Разработка

```bash
npm install
npm run dev        # локальный сервер разработки
npm run typecheck  # проверка типов
npm run test       # unit-тесты (vitest)
npm run build      # production-сборка в dist/
```

## Деплой на GitHub Pages

Workflow `.github/workflows/deploy.yml` собирает и публикует `dist/` при
пуше в ветку `main`. Чтобы деплой заработал, один раз включите в репозитории:

**Settings → Pages → Source → GitHub Actions**

После этого каждый пуш в `main` будет автоматически обновлять сайт.
