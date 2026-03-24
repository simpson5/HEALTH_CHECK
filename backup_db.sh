#!/bin/bash
DB="/Users/simpson/Desktop/SIMPSON/health_check/data/health.db"
BACKUP_DIR="/Users/simpson/Desktop/SIMPSON/health_check/data/backup"
mkdir -p "$BACKUP_DIR"
cp "$DB" "$BACKUP_DIR/health_$(date +%Y%m%d).db"
# 30일 이상 백업 삭제
find "$BACKUP_DIR" -name "health_*.db" -mtime +30 -delete
echo "$(date): Backup completed" >> /tmp/health-backup.log
