
Enum "tb_member_member_gender_enum" {
  "1"
  "2"
}

Enum "tb_member_member_approve_enum" {
  "1"
  "2"
}

Table "course_information" {
  "courseid" int(11) [pk, not null]
  "planid" int(11) [not null]
  "infoid" int(11) [default: NULL]
  "subject_id" int(11) [not null]
  "year" varchar(10) [default: NULL]
  "term" varchar(10) [default: NULL]
  Note: 'แผนการเรียน'
}

Table "create_study_table" {
  "field_id" int(11) [pk, not null]
  "teacher_id" int(11) [not null]
  "courseid" int(11) [not null]
  "room_id" int(11) [not null]
  "planid" int(11) [not null]
  "date" varchar(20) [default: NULL]
  "start_time" int(11) [default: NULL]
  "end_time" int(11) [default: NULL]
  "table_split_status" varchar(11) [default: NULL]
  "split_status" int(11) [default: NULL]
  "group_name" varchar(50) [default: NULL]
  "term" varchar(10) [default: NULL]
  Note: 'เก็บข้อมูลตารางเรียน'
}

Table "group_information" {
  "infoid" int(11) [pk, not null]
  "planid" int(11) [not null]
  "sublevel" varchar(11) [default: NULL]
  "group_name" varchar(50) [default: NULL]
  "term" int(11) [default: NULL]
  "subterm" varchar(10) [not null]
  "summer" int(11) [default: NULL]
  "year" varchar(10) [default: NULL]
  "student_id" varchar(50) [default: NULL]
  Note: 'เก็บกลุ่มการเรียน'
}

Table "more_plan" {
  "more_id" int(11) [pk, not null]
  "planid" int(11) [not null]
  "infoid" int(11) [not null]
  "descriptionterm1" varchar(255) [not null]
  "descriptionterm2" varchar(255) [not null]
  "Headofdepartment" varchar(255) [not null]
  "HeadofCurriculum" varchar(255) [not null]
  "DeputyDirector" varchar(255) [not null]
  "Director" varchar(255) [not null]
}

Table "room" {
  "room_id" int(11) [pk, not null]
  "room_name" varchar(50) [default: NULL]
  "room_type" varchar(50) [default: NULL]
  Note: 'เก็บข้อมูลห้อง'
}

Table "study_plans" {
  "planid" int(11) [pk, not null]
  "course" varchar(255) [default: NULL]
  "year" varchar(10) [default: NULL]
  "student_id" varchar(50) [default: NULL]
  Note: 'เก็บปีการศึกษา'
}

Table "subject" {
  "subject_id" int(11) [pk, not null]
  "course_code" varchar(50) [default: NULL]
  "course_name" varchar(255) [default: NULL]
  "theory" int(11) [default: NULL]
  "comply" int(11) [default: NULL]
  "credit" int(11) [default: NULL]
  "subject_category" varchar(50) [default: NULL]
  "subject_groups" varchar(50) [default: NULL]
  "planid" int(11) [not null]
  Note: 'เก็บตัววิชา'
}

Table "tb_member" {
  "member_id" int(11) [pk, not null]
  "member_code" varchar(20) [not null]
  "member_password" varchar(255) [default: NULL]
  "member_title" varchar(50) [not null]
  "member_firstname" varchar(200) [default: NULL]
  "member_lastname" varchar(200) [not null]
  "member_gender" tb_member_member_gender_enum [default: NULL]
  "member_email" varchar(100) [default: NULL]
  "member_tel" varchar(20) [default: NULL]
  "member_mobile" varchar(20) [not null]
  "member_fax" varchar(20) [default: NULL]
  "member_address" varchar(255) [default: NULL]
  "member_district" varchar(50) [default: NULL]
  "province_id" int(5) [not null]
  "member_zipcode" varchar(45) [default: NULL]
  "member_registerdate" date [default: NULL]
  "member_company" varchar(100) [not null]
  "member_company_no" int(13) [not null]
  "member_level" varchar(200) [not null]
  "member_approve" tb_member_member_approve_enum [not null, note: 'อนุมัติ/ปฏิเสธ']
  "member_last_login" date [not null]
  "member_note" text [not null]
  "member_line_token" varchar(255) [not null]
  "member_line_token2" varchar(255) [not null]
  "member_line_token3" varchar(255) [not null]
  "member_line_token4" varchar(255) [not null]
  "member_line_token5" varchar(255) [not null]
  "member_type" varchar(100) [not null]
  "student_id" int(11) [not null]
  "member_img" varchar(255) [not null]
}

Table "teacher_info" {
  "teacher_id" int(11) [pk, not null]
  "prefix" varchar(10) [default: NULL]
  "fname" varchar(50) [default: NULL]
  "lname" varchar(50) [default: NULL]
  "department" varchar(255) [default: NULL]
  Note: 'เก็บข้อมูลครูผู้สอน'
}

Ref "FK_group_information_TO_course_information":"group_information"."infoid" < "course_information"."infoid"

Ref "FK_subject_TO_course_information":"subject"."subject_id" < "course_information"."subject_id"

Ref "FK_course_information_TO_create_study_table":"course_information"."courseid" < "create_study_table"."courseid"

Ref "FK_room_TO_create_study_table":"room"."room_id" < "create_study_table"."room_id"

Ref "FK_teacher_info_TO_create_study_table":"teacher_info"."teacher_id" < "create_study_table"."teacher_id"

Ref "FK_study_plans_TO_group_information":"study_plans"."planid" < "group_information"."planid"

Ref "fk_infoid":"group_information"."infoid" < "more_plan"."infoid" [update: cascade, delete: cascade]

Ref "fk_planid":"study_plans"."planid" < "more_plan"."planid" [update: cascade, delete: cascade]

Ref "FK_study_plans_TO_subject":"study_plans"."planid" < "subject"."planid"


