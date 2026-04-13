#!/bin/bash
# 전체 백업: DB + 사진 + 설정
BASE="/Users/simpson/Desktop/SIMPSON/health_check"
BACKUP_DIR="$BASE/data/backup"
DATE=$(date +%Y%m%d)
mkdir -p "$BACKUP_DIR"

# 전체 압축 백업
tar -czf "$BACKUP_DIR/health_${DATE}.tar.gz" \
    -C "$BASE" \
    data/health.db \
    photos/ \
    uploads/ \
    data/config.json \
    2>/dev/null

# 30일 이상 일일 백업 삭제
find "$BACKUP_DIR" -name "health_*.tar.gz" ! -name "weekly_*" -mtime +30 -delete

# 월요일이면 주간 백업 (4주 보관)
if [ $(date +%u) -eq 1 ]; then
    cp "$BACKUP_DIR/health_${DATE}.tar.gz" "$BACKUP_DIR/weekly_${DATE}.tar.gz"
fi
find "$BACKUP_DIR" -name "weekly_*.tar.gz" -mtime +28 -delete

echo "$(date): Full backup completed" >> /tmp/health-backup.log
