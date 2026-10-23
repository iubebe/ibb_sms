import type { WifiSecurity } from '@/api/types'

export const WIFI_SECURITY_LABELS: Record<WifiSecurity, string> = {
  WPA: 'WPA/WPA2/WPA3',
  WEP: 'WEP',
  nopass: 'Không mật khẩu',
}
