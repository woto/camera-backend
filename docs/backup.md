## Server

```bash
cd /camera && \
docker compose exec db pg_dump -d camera_production -U postgres > /backup/camera.dump
```

## Developer machine

```bash
cd ~/work/camera-backend && \
rsync -avz root@5.101.180.153:/camera/.env .
```

```bash
cd ~/work/camera-backend/storage && \
rsync -avz root@5.101.180.153:/var/lib/docker/volumes/camera_camera_storage/_data/ .

cd ~/backup && \
rsync -avz root@5.101.180.153:/backup/camera.dump .

cd ~/work/camera-backend && \
DISABLE_DATABASE_ENVIRONMENT_CHECK=1 rake db:drop && \
DISABLE_DATABASE_ENVIRONMENT_CHECK=1 rake db:create && \
docker exec -i camera_db psql -U postgres -d camera_development < ~/backup/camera.dump

DISABLE_DATABASE_ENVIRONMENT_CHECK=1 ./bin/rails db:schema:load:queue
DISABLE_DATABASE_ENVIRONMENT_CHECK=1 ./bin/rails db:schema:load:cache

