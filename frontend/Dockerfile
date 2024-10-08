FROM node:18.12.1 as builder

COPY . /app
WORKDIR /app

ENV GENERATE_SOURCEMAP=false
ENV NODE_OPTIONS=--max_old_space_size=8192

RUN yarn -v
RUN yarn --non-interactive --ignore-optional --network-timeout 500000
# RUN yarn run build

# FROM builder as builder_public
# RUN yarn run build_public

# FROM builder as builder_dashboard
# RUN yarn run build_dashboard

FROM builder as builder_all
RUN yarn run build

FROM polinux/mkdocs:1.5.2 as user_docs
COPY ./user_docs /mkdocs
RUN bash -c "cd /mkdocs && mkdocs build --strict"


# Ngnix
FROM nginx:latest

# Make /var/cache/nginx/ writable by non-root users
RUN chgrp nginx /var/cache/nginx/
RUN chmod -R g+w /var/cache/nginx/

RUN chgrp nginx /var/log/nginx/
RUN chmod -R g+w /var/log/nginx/

# Write the PID file to a location where regular users have write access.
RUN sed --regexp-extended --in-place=.bak 's%^pid\s+/var/run/nginx.pid;%pid /var/tmp/nginx.pid;%' /etc/nginx/nginx.conf

# COPY --from=builder_public  --chmod=775 /build/public_page /var/www/html/home
# COPY --from=builder_dashboard  --chmod=775 /build/dashboard /var/www/html/dashboard

COPY --from=builder_all /app/build /var/www/frontend
RUN chgrp nginx /var/www/frontend
RUN chmod -R g+w /var/www/frontend

COPY --from=user_docs /mkdocs/site /var/www/docs
RUN chgrp nginx /var/www/docs
RUN chmod -R g+w /var/www/docs

USER nginx
