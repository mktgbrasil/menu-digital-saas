# 📌 Painel de Referências

Central de reels, repositórios open-source, sites e ideias de skills que podem
fazer o **menu-digital-saas** (e a nossa forma de trabalhar) evoluir.

O objetivo é simples: **nada que você salva se perde.** Cada reel ou referência
vira uma linha versionada no git — buscável, categorizada e com status de
"o que fazer com isso".

---

## 🎬 Como fazer o Claude "assistir" um reel

O Claude não abre vídeo do Instagram/TikTok direto de um link. Mas existe uma
skill open-source que resolve isso baixando o vídeo, extraindo os frames e
transcrevendo o áudio localmente:

**[bradautomates/claude-video](https://github.com/bradautomates/claude-video)** (9.5k+ ⭐)

### Instalação (na SUA máquina, no Claude Code local)

```bash
/plugin marketplace add bradautomates/claude-video
/plugin install watch@claude-video
```

Na primeira execução ela instala sozinha o `yt-dlp` e o `ffmpeg`.

### Uso

```bash
/watch https://www.instagram.com/reel/XXXX/ do que trata esse reel? é código, site ou skill?
```

> ⚠️ **Importante — reels salvos/privados:** o download via `yt-dlp` de reels
> privados ou salvos exige os **seus cookies de login** do Instagram. Isso só
> funciona onde você está logado (sua máquina). Reels públicos baixam sem
> login. Por isso a etapa de "assistir" roda **localmente**, e o resultado
> categorizado vem parar aqui, neste painel.

### Alternativas

- **[Mharis-code/videoanalyzer](https://github.com/Mharis-code/videoanalyzer)** — foca em rede social e já cospe um relatório estruturado (hook, storytelling, CTA, playbook).
- **[mathiaschu/watch](https://github.com/mathiaschu/watch)** — fork com transcrição 100% local (sem API key).

---

## 🔄 Fluxo de trabalho

1. Você roda `/watch <link>` localmente → sai a transcrição/análise do reel.
2. Cola o resultado (ou só um resumo de 1–2 linhas) numa conversa com o Claude.
3. O Claude **categoriza** e adiciona uma linha em [`catalogo.md`](./catalogo.md).
4. O que for realmente bom pra virar skill ou entrar no código ganha status
   `🔨 executar` e a gente parte pra ação.

---

## 🏷️ Categorias

| Emoji | Categoria | O que é |
|-------|-----------|---------|
| 🧩 | `skill` | Ideia que pode virar uma skill/automação do Claude |
| 💻 | `código` | Lib, repo ou snippet open-source pra usar no projeto |
| 🎨 | `site` | Referência de design, UX, landing, inspiração |
| 💡 | `ideia` | Feature ou melhoria de produto pro menu digital |

## 🚦 Status

| Emoji | Status | Significado |
|-------|--------|-------------|
| 🆕 | `a triar` | Recém-chegado, ainda não avaliado |
| 🔍 | `avaliar` | Vale investigar mais a fundo |
| 🔨 | `executar` | Aprovado, virou tarefa |
| ✅ | `feito` | Aplicado no projeto |
| 🗄️ | `arquivo` | Interessante, mas não agora |

---

Veja o [`catalogo.md`](./catalogo.md) para a lista completa e o
[`_template.md`](./_template.md) para o formato de uma entrada detalhada.
