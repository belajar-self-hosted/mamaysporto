SELECT setval(
  pg_get_serial_sequence('admins', 'id')::regclass,
  GREATEST(COALESCE(MAX(id), 1), 1),
  COUNT(*) > 0
)
FROM admins;
