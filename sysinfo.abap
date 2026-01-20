REPORT Z_SYS_INFO.

WRITE: / 'Current Client:', SY-MANDT,
       / 'System ID:', SY-SYSID,
       / 'User Name:', SY-UNAME,
       / 'Language:', SY-LANGU,
       / 'Current Date:', SY-DATUM,
       / 'Current Time:', SY-UZEIT,
       / 'Program Name:', SY-REPID,
       / 'Client Type:', SY-CLTYP,
       / 'Host Name:', SY-HOST.