import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isValidPhone, type CustomerFormValues } from './customer-form-values'

interface CustomerFieldsProps {
  /** Prefix that keeps input ids unique when several forms are mounted. */
  idPrefix: string
  values: CustomerFormValues
  onChange: (values: CustomerFormValues) => void
}

/** Optional name / phone / address inputs, used when creating an order and when editing one. */
export function CustomerFields({ idPrefix, values, onChange }: CustomerFieldsProps) {
  const phoneInvalid = !isValidPhone(values.phone)
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-name`}>Tên khách hàng</Label>
        <Input
          id={`${idPrefix}-name`}
          maxLength={100}
          autoComplete="off"
          placeholder="Không bắt buộc"
          className="h-11"
          value={values.name}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-phone`}>Số điện thoại</Label>
        <Input
          id={`${idPrefix}-phone`}
          type="tel"
          inputMode="tel"
          maxLength={20}
          autoComplete="off"
          placeholder="Không bắt buộc"
          className="h-11"
          value={values.phone}
          onChange={(e) => onChange({ ...values, phone: e.target.value })}
          aria-invalid={phoneInvalid}
        />
        {phoneInvalid && <p className="text-xs text-destructive">Số điện thoại không hợp lệ.</p>}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-address`}>Địa chỉ</Label>
        <Input
          id={`${idPrefix}-address`}
          maxLength={255}
          autoComplete="off"
          placeholder="Không bắt buộc"
          className="h-11"
          value={values.address}
          onChange={(e) => onChange({ ...values, address: e.target.value })}
        />
      </div>
    </div>
  )
}
