FROM node:12 as releaser

COPY . /repo
WORKDIR /repo

RUN npm install && npm run production

FROM caddy 

WORKDIR /web
COPY --from=releaser /repo/dist ./dist
COPY --from=releaser /repo/plugins ./plugins
COPY --from=releaser /repo/pages ./pages
COPY --from=releaser /repo/index.html ./index.html
COPY --from=releaser /repo/index2.html ./index2.html
COPY --from=releaser /repo/index3.html ./index3.html
COPY --from=releaser /repo/starter.html ./starter.html

CMD ["caddy", "file-server", "-root=/web"]
