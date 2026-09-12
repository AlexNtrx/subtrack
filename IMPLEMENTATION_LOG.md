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

---

## จุดที่ 4: เชื่อมต่อ Frontend เข้ากับ Backend API (Full CRUD)
- **วันที่**: 2026-09-12
- **ไฟล์ที่แก้ไข**:
  - `functions/tracker_utils.js`
  - `handlers/sub_handlers.js`
- **รายละเอียดการแก้ไข**:
  1. สร้างฟังก์ชัน `loadSubscriptions()` ใน `tracker_utils.js` ดึงข้อมูลผ่าน `GET handlers/get_subscriptions.php` มาแสดงผลอัตโนมัติเมื่อเปิดหน้าเว็บ พร้อมจัดการ State กรณีเกิด Error หรือไม่สามารถเชื่อมต่อฐานข้อมูลได้
  2. เชื่อมต่อฟอร์มเพิ่ม/แก้ไข (`addSubForm`) เข้ากับ `POST handlers/add_subscription.php` และ `handlers/update_subscription.php` แบบ Asynchronous JSON พร้อมอัปเดตสถานะปุ่ม "Tallennetaan..." ป้องกันการกดซ้ำ
  3. เชื่อมต่อปุ่มเปิด/ปิดสถานะ (`togglePause`) เข้ากับ `POST handlers/toggle_status.php` เพื่อเปลี่ยนสถานะในฐานข้อมูล MySQL จริง
  4. เชื่อมต่อปุ่มลบ (`deleteSub`) เข้ากับ `POST handlers/delete_subscription.php` พร้อมกล่องยืนยันการลบ
  5. เมื่อการดำเนินการใด ๆ สำเร็จ ข้อมูลจะถูกโหลดใหม่จาก Database และบันทึกถาวร ไม่สูญหายเมื่อรีเฟรชหน้าจอ
- **สถานะ**: สำเร็จ (Verified)

---

## จุดที่ 5: แก้ไขตรรกะการคำนวณวันรอบบิลถัดไป (Next Due Date)
- **วันที่**: 2026-09-12
- **ไฟล์ที่แก้ไข**:
  - `functions/tracker_utils.js`
- **รายละเอียดการแก้ไข**:
  1. ปรับปรุงฟังก์ชัน `updateSummaryStats()` ในส่วนคำนวณวัน eräpäivä ถัดไป โดยเปรียบเทียบกับวันที่ปัจจุบัน (`YYYY-MM-DD`) แบบ Timezone-independent
  2. กรองเฉพาะรายการที่ eräpäivä เป็นวันนี้หรืออนาคต (`seuraava_era >= todayStr`) และเรียงลำดับจากใกล้ที่สุดไปไกลที่สุด เพื่อแสดงเป็น "Seuraava eräpäivä" อย่างถูกต้อง
  3. เพิ่มการแสดงผลข้อความพิเศษ "Tänään!" หากวันครบกำหนดตรงกับวันนี้พอดี
  4. กรณีไม่มีบิลในอนาคต แต่มีบิลค้างในอดีต จะแสดงชื่อบริการพร้อมวงเล็บกำกับว่า "(Erääntynyt)" ให้ผู้ใช้รับทราบอย่างชัดเจน
- **สถานะ**: สำเร็จ (Verified)

---

## จุดที่ 6: ปรับปรุง Modal UX และ Responsive CSS
- **วันที่**: 2026-09-12
- **ไฟล์ที่แก้ไข**:
  - `handlers/sub_handlers.js`
  - `css/modal.css`
  - `css/controls.css`
  - `css/cards.css`
  - `css/header.css`
- **รายละเอียดการแก้ไข**:
  1. เพิ่มฟังก์ชันการปิด Modal เมื่อผู้ใช้กดปุ่ม `Escape` บนคีย์บอร์ด
  2. เพิ่ม Event Listener ดักจับการคลิกที่พื้นหลังมืด (Backdrop Overlay) นอก Modal Card เพื่อปิดหน้าต่างอัตโนมัติ
  3. ปรับปรุงการสลับข้อความปุ่มบันทึกระหว่าง "Tallenna tilaus" (เมื่อเพิ่มใหม่) และ "Päivitä tilaus" (เมื่อแก้ไข) อย่างถูกต้อง
  4. เพิ่ม Responsive Breakpoint `@media (max-width: 640px)` สำหรับ Modal ให้ปรับช่องกรอก `.form-row` เป็นคอลัมน์เดี่ยว และจัดวางปุ่ม Actions เต็มความกว้าง
  5. เพิ่ม Mobile Styles ให้ Filter Tabs เลื่อน Scroll แนวนอนได้บนหน้าจอแคบโดยไม่ตกขอบ
  6. เพิ่ม Mobile Styles ให้ Header และ Cards Grid สวยงามบนหน้าจอมือถือ (<= 480px)
- **สถานะ**: สำเร็จ (Verified)

---

## การแก้ไข Conflict และผสานสาขา (Merge Conflict Resolution: origin/main -> master)
- **วันที่**: 2026-09-12
- **สาขาที่เกี่ยวข้อง**: `origin/main` ผสานเข้ากับ `master`
- **รายละเอียดการแก้ไข**:
  1. แก้ไข Conflict ใน `functions/db.php`: รวม `PDO::ATTR_DEFAULT_FETCH_MODE` ที่ถูกต้อง พร้อมระบบซ่อน Database Error และบันทึก `error_log`
  2. แก้ไข Conflict ใน `handlers/*.php`: รวมระบบ ENUM Whitelist, การตรวจสอบฟอร์แมตวันที่ `YYYY-MM-DD`, การตรวจสอบ 404 (ID Existence Check) และระบบ Response JSON ที่ปลอดภัย
  3. ผสานโครงสร้าง JavaScript แบบโมดูลาร์ (`js/api.js`, `js/ui.js`, `js/app.js`):
     - ป้องกัน XSS ด้วย `escapeHtml()`
     - ย้ายฟังก์ชันการคำนวณ eräpäivä ถัดไปที่ปรับปรุงแล้ว (ไม่นำวันในอดีตมาแสดง) เข้า `js/ui.js`
     - ย้ายฟังก์ชันการปิด Modal ด้วย `Escape` และ Backdrop Overlay เข้า `js/app.js`
     - ปรับข้อความปุ่มบันทึก/อัปเดตแบบ Dynamic
     - ลบไฟล์ JavaScript เก่า (`functions/tracker_utils.js`, `handlers/sub_handlers.js`) ที่ไม่ได้ใช้งานแล้วออก
  4. แก้ไข Conflict ใน CSS (`css/cards.css`, `css/controls.css`, `css/header.css`, `css/modal.css`): รวมโครงสร้าง Responsive ขั้นสูง, Skeleton Loading Cards, Toast Notifications, และ Empty States เข้าด้วยกันอย่างไร้รอยต่อ
- **สถานะ**: ผสานสำเร็จเรียบร้อย (Merged & Verified)







