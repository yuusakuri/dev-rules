# Image that runs the figure and document tools described in guidelines/documentation.
FROM node:22.23.4-trixie-slim

ARG PLANTUML_VERSION=1.2026.9
ARG PLANTUML_SHA256=aa4a1d06f8911c4b842beff4828dd955be431692b631a312d04c0e9fab9581de

RUN apt-get update \
  && apt-get install --no-install-recommends -y \
    ca-certificates curl chromium fonts-noto-cjk graphviz imagemagick openjdk-21-jre-headless poppler-utils \
  && rm -rf /var/lib/apt/lists/*

# Debian's chromium wrapper reads this file. The container blocks the user namespaces
# that the Chromium sandbox needs, so Chromium runs without the sandbox.
RUN echo 'export CHROMIUM_FLAGS="$CHROMIUM_FLAGS --no-sandbox"' > /etc/chromium.d/no-sandbox

RUN mkdir -p /opt/plantuml \
  && curl -fsSL -o /opt/plantuml/plantuml.jar \
    "https://github.com/plantuml/plantuml/releases/download/v${PLANTUML_VERSION}/plantuml-${PLANTUML_VERSION}.jar" \
  && echo "${PLANTUML_SHA256}  /opt/plantuml/plantuml.jar" | sha256sum -c -

ENV PUPPETEER_SKIP_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
  COREPACK_HOME=/opt/corepack \
  HOME=/tmp

RUN corepack enable && corepack prepare pnpm@10.28.2 --activate && chmod -R a+rX /opt/corepack

COPY tools /opt/dev-rules/tools
RUN for tool in markdown-to-docx mermaid-cli svg-to-png; do \
    pnpm --dir "/opt/dev-rules/tools/$tool" install --frozen-lockfile || exit 1; \
  done \
  && printf '#!/bin/sh\nexec node /opt/dev-rules/tools/markdown-to-docx/convert.mjs "$@"\n' > /usr/local/bin/markdown-to-docx \
  && printf '#!/bin/sh\nexec node /opt/dev-rules/tools/svg-to-png/convert.mjs "$@"\n' > /usr/local/bin/svg-to-png \
  && printf '#!/bin/sh\nexec java -jar /opt/plantuml/plantuml.jar "$@"\n' > /usr/local/bin/plantuml \
  && printf '#!/bin/sh\nexec node /opt/dev-rules/tools/mermaid-cli/node_modules/@mermaid-js/mermaid-cli/src/cli.js "$@"\n' > /usr/local/bin/mmdc \
  && chmod 755 /usr/local/bin/markdown-to-docx /usr/local/bin/mmdc /usr/local/bin/plantuml /usr/local/bin/svg-to-png

WORKDIR /data
