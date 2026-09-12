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

