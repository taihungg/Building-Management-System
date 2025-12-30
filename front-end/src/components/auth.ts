export const authProvider = {
    // Lưu tất cả thông tin đăng nhập cùng lúc
    saveAuthData: (role: string, accountId: string, personId: string) => {
      localStorage.setItem('user_role', role);
      localStorage.setItem('account_id', accountId);
      localStorage.setItem('person_id', personId);
    },
  
    // Các hàm lấy từng giá trị ra khi cần
    getRole: () => localStorage.getItem('user_role'),
    getAccountId: () => localStorage.getItem('account_id'),
    getPersonId: () => localStorage.getItem('person_id'),
  
    // Kiểm tra xem đã đăng nhập chưa (chỉ cần check 1 cái đại diện)
    isAuthenticated: () => !!localStorage.getItem('account_id'),
  
    // Hàm đăng xuất: Xóa sạch dấu vết
    logout: () => {
      localStorage.removeItem('user_role');
      localStorage.removeItem('account_id');
      localStorage.removeItem('person_id');
      // Có thể dùng localStorage.clear() nếu chú muốn xóa sạch bách mọi thứ khác
    }
  };