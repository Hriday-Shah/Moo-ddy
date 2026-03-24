import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminHome } from './pages/AdminHome'
import { AdminNewItem } from './pages/AdminNewItem'
import { CustomerHome } from './pages/CustomerHome'
import { DeliveryHome } from './pages/DeliveryHome'
import { LoginAdmin } from './pages/LoginAdmin'
import { LoginCustomer } from './pages/LoginCustomer'
import { LoginDelivery } from './pages/LoginDelivery'
import { SignupCustomer } from './pages/SignupCustomer'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login/customer" replace />} />

      <Route path="/login/customer" element={<LoginCustomer />} />
      <Route path="/login/admin" element={<LoginAdmin />} />
      <Route path="/login/delivery" element={<LoginDelivery />} />
      <Route path="/signup/customer" element={<SignupCustomer />} />

      <Route path="/customer" element={<CustomerHome />} />
      <Route path="/admin" element={<AdminHome />} />
      <Route path="/admin/items/new" element={<AdminNewItem />} />
      <Route path="/delivery" element={<DeliveryHome />} />
      <Route path="*" element={<Navigate to="/login/customer" replace />} />
    </Routes>
  )
}

export default App
