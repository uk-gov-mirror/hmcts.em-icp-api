# ---- Base image ----
FROM hmctspublic.azurecr.io/base/node:12-alpine as base
COPY --chown=hmcts:hmcts . .
RUN yarn install --production \
  && yarn cache clean

# ---- Build image ----
FROM base as build
RUN yarn install --production  \
    && yarn cache clean

# ---- Runtime image ----
FROM base as runtime
COPY --from=build $WORKDIR/src/main ./src/main
# TODO: which port do we want to expose?
EXPOSE 3100
