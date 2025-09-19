# Super Agent Ninja — DigitalOcean Edition

A full-stack, containerized **super agent** system with:
- **LLM Chat UI** (Next.js)
- **API** (Fastify)
- **Playwright** browser automation service
- **Caddy** reverse proxy w/ HTTPS
- **Terraform** to provision DigitalOcean infra
- **Docker Compose** for prod host
- **GitHub Actions** for CI/CD

> Minimal, opinionated, and ready to ship. Extend at will.

---

## Quick Start (Local via Docker Compose)

1) Copy `.env.example` to `.env` and fill values:
```bash
cp .env.example .env
```

2) Spin up:
```bash
docker compose up --build
```

3) Visit https://localhost (self-signed cert)

---

## One-Shot Deploy to DigitalOcean

1) Install deps:
```bash
cd infra/terraform/do
terraform init
```

2) Provision:
```bash
terraform apply -auto-approve \
  -var "do_token=$DO_TOKEN" \
  -var "public_ssh_key=$(cat ~/.ssh/id_rsa.pub)" \
  -var "agent_domain=agent.example.com" \
  -var "project_name=super-agent" \
  -var "region=nyc3" \
  -var "create_domain=false"
```

3) Push to GitHub → CI/CD kicks in automatically.

---

## Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Next.js UI    │    │   Caddy      │    │   Fastify API   │
│   :3000         │◄──►│   :80/443    │◄──►│   :4000         │
└─────────────────┘    └──────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │ Playwright      │
                       │ Runner :5000    │
                       └─────────────────┘
```

---

## Services

| Service   | Port | Purpose                    |
|-----------|------|----------------------------|
| Next.js   | 3000 | Chat UI, streaming         |
| Fastify   | 4000 | REST/GraphQL API           |
| Playwright| 5000 | Browser automation tasks   |
| Caddy     | 80/443| HTTPS reverse proxy       |

---

## Development

Each service has its own dev script:

```bash
# UI
cd web && npm run dev

# API
cd api && npm run dev

# Playwright
cd runner && npm run dev
```

---

## Secrets

Required env vars (see `.env.example`):
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- `GHCR_TOKEN` (GitHub Container Registry)
- `DO_TOKEN` (DigitalOcean)

---

## Extending

- Add new routes in `api/src/routes/`
- Add new agents in `runner/src/agents/`
- UI components live in `web/components/`
- Infrastructure in `infra/terraform/do/`