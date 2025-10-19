export enum UserRole {
  ADMIN = 4,
  YONETICI = 1,
  CALISAN = 2,
  MUSTERI = 3,
}

// Türkçe isimler için mapping (isteğe bağlı)
export const RoleNames: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Admin',
  [UserRole.YONETICI]: 'Yönetici',
  [UserRole.CALISAN]: 'Çalışan',
  [UserRole.MUSTERI]: 'Müşteri',
};