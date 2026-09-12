# SubTracker Implementation Log

บันทึกประวัติการปรับปรุง แก้ไข และพัฒนาโปรเจกต์ SubTracker ทีละจุด (Step-by-Step) ตามแผนงาน

---

## สารบัญการแก้ไข
- [Baseline](#baseline)
- [จุดที่ 1: ความปลอดภัย XSS และปรับปรุง Event Handlers](#จุดที่-1-ความปลอดภัย-xss-และปรับปรุง-event-handlers)
- [จุดที่ 2: ความปลอดภัยและ Input Validation ฝั่ง Backend](#จุดที่-2-ความปลอดภัยและ-input-validation-ฝั่ง-backend)
- [จุดที่ 3: เพิ่มตัวกรองหมวดหมู่ "Muut" ใน Controls Bar](#จุดที่-3-เพิ่มตัวกรองหมวดหมู่-muut-ใน-controls-bar)
- [จุดที่ 4: เชื่อมต่อ Frontend เข้ากับ Backend API (Full CRUD)](#จุดที่-4-เชื่อมต่อ-frontend-เข้ากับ-backend-api-full-crud)
- [จุดที่ 5: แก้ไขตรรกะการคำนวณวันรอบบิลถัดไป (Next Due Date)](#จุดที่-5-แก้ไขตรรกะการคำนวณวันรอบบิลถัดไป-next-due-date)
- [จุดที่ 6: ปรับปรุง Modal UX และ Responsive CSS](#จุดที่-6-ปรับปรุง-modal-ux-และ-responsive-css)

---

## Baseline
- **วันที่**: 2026-09-12
- **รายละเอียด**: บันทึกโครงสร้างไฟล์เดิมก่อนเริ่มการแก้ไข (Database schema, Functions, Handlers) เพื่อให้ Git diff ของแต่ละขั้นตอนแสดงการเปลี่ยนแปลงอย่างชัดเจน

---

## จุดที่ 1: ความปลอดภัย XSS และปรับปรุง Event Handlers
- **วันที่**: 2026-09-12
- **ไฟล์ที่แก้ไข**:
  - `functions/tracker_utils.js`
  - `handlers/sub_handlers.js`
- **รายละเอียดการแก้ไข**:
  1. สร้างฟังก์ชัน `escapeHtml(str)` ใน `functions/tracker_utils.js` เพื่อแปลงอักขระพิเศษ (`&`, `<`, `>`, `"`, `'`) ป้องกัน Stored Cross-Site Scripting (XSS)
  2. Escape ข้อมูลผู้ใช้ทุกฟิลด์ (`palvelun_nimi`, `kategoria`, `seuraava_era`, `maksutapa`, `tila`, `id`) ก่อนนำไปแทรกใน `card.innerHTML`
  3. ยกเลิกการใช้ inline `onclick="togglePause('...')"` ที่เสี่ยงต่อการหลุดของ string quote และ CSP
  4. เพิ่ม class `.btn-toggle-pause`, `.btn-edit-sub`, `.btn-delete-sub` พร้อม `data-id` บนการ์ด
  5. ใช้งาน Event Delegation บน `#subscriptionsContainer` ใน `handlers/sub_handlers.js` เพื่อดักจับคลิกผ่าน `data-id` อย่างปลอดภัย
- **สถานะ**: สำเร็จ (Verified)

---

## จุดที่ 2: ความปลอดภัยและ Input Validation ฝั่ง Backend
- **วันที่**: 2026-09-12
- **ไฟล์ที่แก้ไข**:
  - `functions/db.php`
  - `handlers/get_subscriptions.php`
  - `handlers/add_subscription.php`
  - `handlers/update_subscription.php`
  - `handlers/delete_subscription.php`
  - `handlers/toggle_status.php`
- **รายละเอียดการแก้ไข**:
  1. ป้องกัน Information Disclosure: ปรับปรุงการ catch `PDOException` ในทุกไฟล์ โดยบันทึกข้อผิดพลาดจริงผ่าน `error_log()` และส่งข้อความ Generic กลับไปทาง JSON ไม่เปิดเผยชื่อตารางหรือ Database Credential
  2. ป้องกัน SQL Exception จากค่าแปลกปลอมด้วย ENUM Whitelisting สำหรับ `laskutusjakso`, `kategoria`, `tila`
  3. เพิ่มการตรวจสอบความถูกต้องของฟอร์แมตวันที่ `YYYY-MM-DD` ด้วย `DateTime::createFromFormat` ใน `add_subscription.php` และ `update_subscription.php`
  4. เพิ่มการตรวจสอบการมีอยู่ของข้อมูลจริง (Existence check) ใน `update_subscription.php`, `delete_subscription.php`, และ `toggle_status.php` หากไม่มี ID ในระบบจะตอบกลับ HTTP 404 พร้อมข้อความที่ชัดเจน
- **สถานะ**: สำเร็จ (Verified & Syntax checked)

---

## จุดที่ 3: เพิ่มตัวกรองหมวดหมู่ "Muut" ใน Controls Bar
- **วันที่**: 2026-09-12
- **ไฟล์ที่แก้ไข**:
  - `components/controls.php`
- **รายละเอียดการแก้ไข**:
  1. เพิ่มปุ่มแท็บ `<button class="tab-btn" data-cat="Muut">Muut</button>` ในส่วน Filter Tabs
  2. ทำให้ผู้ใช้สามารถกดกรองดูเฉพาะรายการในหมวดหมู่ "Muut" (อื่นๆ) ได้ครบถ้วนตรงกับหมวดหมู่ที่มีในฐานข้อมูลและ Modal
- **สถานะ**: สำเร็จ (Verified)



