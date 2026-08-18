-- ENUMS
CREATE TYPE public.app_role AS ENUM ('area_manager','branch_manager','shift_manager','employee');
CREATE TYPE public.task_priority AS ENUM ('high','medium','low');
CREATE TYPE public.occurrence_status AS ENUM ('pending','completed');
CREATE TYPE public.photo_kind AS ENUM ('before','after');

CREATE TABLE public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text NOT NULL UNIQUE,
  name text NOT NULL,
  city text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.branches TO authenticated;
GRANT ALL ON public.branches TO service_role;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid REFERENCES public.branches(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  allows_overtime boolean NOT NULL DEFAULT false,
  overtime_end_time time,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shifts TO authenticated;
GRANT ALL ON public.shifts TO service_role;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  employee_number text NOT NULL,
  full_name text NOT NULL,
  role public.app_role NOT NULL DEFAULT 'shift_manager',
  shift_id uuid REFERENCES public.shifts(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active',
  responsibilities text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (branch_id, employee_number)
);
CREATE INDEX profiles_branch_idx ON public.profiles(branch_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.role_permissions (
  role public.app_role NOT NULL,
  permission text NOT NULL,
  allowed boolean NOT NULL DEFAULT false,
  PRIMARY KEY (role, permission)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.my_profile_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.my_branch_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT branch_id FROM public.profiles WHERE user_id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.my_role()
RETURNS public.app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() ORDER BY role LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.can_access_branch(_branch_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'area_manager') OR _branch_id = public.my_branch_id()
$$;

CREATE OR REPLACE FUNCTION public.can_do(_permission text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT allowed FROM public.role_permissions
                   WHERE role = public.my_role() AND permission = _permission), false)
$$;

CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(),'area_manager') OR public.has_role(auth.uid(),'branch_manager')
$$;

CREATE TABLE public.sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid REFERENCES public.branches(id) ON DELETE CASCADE,
  key text NOT NULL,
  name text NOT NULL,
  icon text NOT NULL DEFAULT 'ListChecks',
  color text NOT NULL DEFAULT 'emerald',
  sort_order int NOT NULL DEFAULT 0,
  is_default boolean NOT NULL DEFAULT false,
  management_only boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sections TO authenticated;
GRANT ALL ON public.sections TO service_role;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  section_id uuid REFERENCES public.sections(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  priority public.task_priority NOT NULL DEFAULT 'medium',
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_shift_id uuid REFERENCES public.shifts(id) ON DELETE SET NULL,
  assign_all boolean NOT NULL DEFAULT false,
  is_management boolean NOT NULL DEFAULT false,
  is_temporary boolean NOT NULL DEFAULT false,
  is_paused boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  due_time time,
  recurrence text NOT NULL DEFAULT 'once',
  interval_minutes int,
  weekday int,
  day_of_month int,
  reminder_minutes int,
  notes text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX tasks_branch_idx ON public.tasks(branch_id);
CREATE INDEX tasks_section_idx ON public.tasks(section_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.task_occurrences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  due_at timestamptz NOT NULL,
  status public.occurrence_status NOT NULL DEFAULT 'pending',
  completed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  completed_at timestamptz,
  completion_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (task_id, due_at)
);
CREATE INDEX occ_branch_due_idx ON public.task_occurrences(branch_id, due_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_occurrences TO authenticated;
GRANT ALL ON public.task_occurrences TO service_role;
ALTER TABLE public.task_occurrences ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.task_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  occurrence_id uuid REFERENCES public.task_occurrences(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_notes TO authenticated;
GRANT ALL ON public.task_notes TO service_role;
ALTER TABLE public.task_notes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.task_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  occurrence_id uuid REFERENCES public.task_occurrences(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  kind public.photo_kind NOT NULL,
  path text NOT NULL,
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_photos TO authenticated;
GRANT ALL ON public.task_photos TO service_role;
ALTER TABLE public.task_photos ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.task_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  occurrence_id uuid REFERENCES public.task_occurrences(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX history_task_idx ON public.task_history(task_id);
GRANT SELECT, INSERT ON public.task_history TO authenticated;
GRANT ALL ON public.task_history TO service_role;
ALTER TABLE public.task_history ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.task_favorites (
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, task_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_favorites TO authenticated;
GRANT ALL ON public.task_favorites TO service_role;
ALTER TABLE public.task_favorites ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.shift_handovers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  from_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  from_shift_id uuid REFERENCES public.shifts(id) ON DELETE SET NULL,
  to_shift_id uuid REFERENCES public.shifts(id) ON DELETE SET NULL,
  notes text,
  overtime_taken boolean NOT NULL DEFAULT false,
  completed_count int NOT NULL DEFAULT 0,
  pending_count int NOT NULL DEFAULT 0,
  overdue_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shift_handovers TO authenticated;
GRANT ALL ON public.shift_handovers TO service_role;
ALTER TABLE public.shift_handovers ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.task_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid REFERENCES public.branches(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  payload jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_templates TO authenticated;
GRANT ALL ON public.task_templates TO service_role;
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY branches_read ON public.branches FOR SELECT TO authenticated
  USING (public.can_access_branch(id));
CREATE POLICY branches_write ON public.branches FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'area_manager')) WITH CHECK (public.has_role(auth.uid(),'area_manager'));

CREATE POLICY shifts_read ON public.shifts FOR SELECT TO authenticated
  USING (branch_id IS NULL OR public.can_access_branch(branch_id));
CREATE POLICY shifts_write ON public.shifts FOR ALL TO authenticated
  USING (public.is_manager()) WITH CHECK (public.is_manager());

CREATE POLICY profiles_read ON public.profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.can_access_branch(branch_id));
CREATE POLICY profiles_write ON public.profiles FOR ALL TO authenticated
  USING (public.is_manager() AND public.can_access_branch(branch_id))
  WITH CHECK (public.is_manager() AND public.can_access_branch(branch_id));

CREATE POLICY user_roles_read ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_manager());

CREATE POLICY role_permissions_read ON public.role_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY role_permissions_write ON public.role_permissions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'area_manager')) WITH CHECK (public.has_role(auth.uid(),'area_manager'));

CREATE POLICY sections_read ON public.sections FOR SELECT TO authenticated
  USING ((branch_id IS NULL OR public.can_access_branch(branch_id))
         AND (management_only = false OR public.is_manager()));
CREATE POLICY sections_write ON public.sections FOR ALL TO authenticated
  USING (public.can_do('manage_sections')) WITH CHECK (public.can_do('manage_sections'));

CREATE POLICY tasks_read ON public.tasks FOR SELECT TO authenticated
  USING (public.can_access_branch(branch_id) AND (is_management = false OR public.is_manager()));
CREATE POLICY tasks_insert ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (public.can_do('create_tasks') AND public.can_access_branch(branch_id));
CREATE POLICY tasks_update ON public.tasks FOR UPDATE TO authenticated
  USING (public.can_do('edit_tasks') AND public.can_access_branch(branch_id))
  WITH CHECK (public.can_do('edit_tasks') AND public.can_access_branch(branch_id));
CREATE POLICY tasks_delete ON public.tasks FOR DELETE TO authenticated
  USING (public.can_do('delete_tasks') AND public.can_access_branch(branch_id));

CREATE POLICY occ_read ON public.task_occurrences FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id
                 AND public.can_access_branch(t.branch_id)
                 AND (t.is_management = false OR public.is_manager())));
CREATE POLICY occ_insert ON public.task_occurrences FOR INSERT TO authenticated
  WITH CHECK (public.can_access_branch(branch_id));
CREATE POLICY occ_update ON public.task_occurrences FOR UPDATE TO authenticated
  USING (public.can_access_branch(branch_id) AND EXISTS (
      SELECT 1 FROM public.tasks t WHERE t.id = task_id AND (
        t.assigned_to IS NULL OR t.assigned_to = public.my_profile_id()
        OR t.assign_all OR public.is_manager())))
  WITH CHECK (public.can_access_branch(branch_id));
CREATE POLICY occ_delete ON public.task_occurrences FOR DELETE TO authenticated
  USING (public.can_do('delete_tasks') AND public.can_access_branch(branch_id));

CREATE POLICY notes_read ON public.task_notes FOR SELECT TO authenticated USING (public.can_access_branch(branch_id));
CREATE POLICY notes_insert ON public.task_notes FOR INSERT TO authenticated WITH CHECK (public.can_access_branch(branch_id));
CREATE POLICY notes_delete ON public.task_notes FOR DELETE TO authenticated
  USING (author_id = public.my_profile_id() OR public.is_manager());

CREATE POLICY photos_read ON public.task_photos FOR SELECT TO authenticated USING (public.can_access_branch(branch_id));
CREATE POLICY photos_insert ON public.task_photos FOR INSERT TO authenticated WITH CHECK (public.can_access_branch(branch_id));
CREATE POLICY photos_delete ON public.task_photos FOR DELETE TO authenticated
  USING (uploaded_by = public.my_profile_id() OR public.is_manager());

CREATE POLICY history_read ON public.task_history FOR SELECT TO authenticated USING (public.can_access_branch(branch_id));
CREATE POLICY history_insert ON public.task_history FOR INSERT TO authenticated WITH CHECK (public.can_access_branch(branch_id));

CREATE POLICY fav_all ON public.task_favorites FOR ALL TO authenticated
  USING (profile_id = public.my_profile_id()) WITH CHECK (profile_id = public.my_profile_id());

CREATE POLICY handover_read ON public.shift_handovers FOR SELECT TO authenticated USING (public.can_access_branch(branch_id));
CREATE POLICY handover_insert ON public.shift_handovers FOR INSERT TO authenticated WITH CHECK (public.can_access_branch(branch_id));

CREATE POLICY templates_read ON public.task_templates FOR SELECT TO authenticated
  USING (branch_id IS NULL OR public.can_access_branch(branch_id));
CREATE POLICY templates_write ON public.task_templates FOR ALL TO authenticated
  USING (public.can_do('manage_templates')) WITH CHECK (public.can_do('manage_templates'));

CREATE POLICY notif_read ON public.notifications FOR SELECT TO authenticated USING (profile_id = public.my_profile_id());
CREATE POLICY notif_update ON public.notifications FOR UPDATE TO authenticated
  USING (profile_id = public.my_profile_id()) WITH CHECK (profile_id = public.my_profile_id());
CREATE POLICY notif_insert ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER tasks_touch BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.generate_occurrences(_branch_id uuid, _horizon_hours int DEFAULT 24)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  t record;
  cursor_ts timestamptz;
  horizon timestamptz := now() + make_interval(hours => _horizon_hours);
  window_start timestamptz := now() - interval '2 days';
  inserted int := 0;
  step interval;
BEGIN
  FOR t IN SELECT * FROM public.tasks
           WHERE branch_id = _branch_id AND is_paused = false AND is_archived = false
  LOOP
    IF t.end_date IS NOT NULL AND t.end_date < CURRENT_DATE THEN CONTINUE; END IF;

    IF t.recurrence = 'once' THEN
      INSERT INTO public.task_occurrences (task_id, branch_id, due_at)
      VALUES (t.id, t.branch_id, (t.start_date + COALESCE(t.due_time, '09:00'::time))::timestamptz)
      ON CONFLICT DO NOTHING;
      inserted := inserted + 1;
      CONTINUE;
    END IF;

    step := CASE t.recurrence
      WHEN 'minutes' THEN make_interval(mins => GREATEST(COALESCE(t.interval_minutes, 60), 15))
      WHEN 'daily' THEN interval '1 day'
      WHEN 'weekly' THEN interval '7 days'
      WHEN 'monthly' THEN interval '1 month'
      WHEN 'yearly' THEN interval '1 year'
      ELSE make_interval(mins => GREATEST(COALESCE(t.interval_minutes, 1440), 15))
    END;

    cursor_ts := (t.start_date + COALESCE(t.due_time, '06:00'::time))::timestamptz;
    WHILE cursor_ts < window_start LOOP
      cursor_ts := cursor_ts + step;
    END LOOP;

    WHILE cursor_ts <= horizon LOOP
      EXIT WHEN t.end_date IS NOT NULL AND cursor_ts::date > t.end_date;
      INSERT INTO public.task_occurrences (task_id, branch_id, due_at)
      VALUES (t.id, t.branch_id, cursor_ts) ON CONFLICT DO NOTHING;
      inserted := inserted + 1;
      cursor_ts := cursor_ts + step;
    END LOOP;
  END LOOP;
  RETURN inserted;
END; $$;
GRANT EXECUTE ON FUNCTION public.generate_occurrences(uuid, int) TO authenticated;

INSERT INTO public.role_permissions (role, permission, allowed) VALUES
 ('area_manager','create_tasks',true),('area_manager','edit_tasks',true),('area_manager','delete_tasks',true),
 ('area_manager','assign_tasks',true),('area_manager','manage_sections',true),('area_manager','manage_templates',true),
 ('area_manager','manage_users',true),('area_manager','view_reports',true),('area_manager','cross_branch',true),
 ('area_manager','management_tasks',true),
 ('branch_manager','create_tasks',true),('branch_manager','edit_tasks',true),('branch_manager','delete_tasks',true),
 ('branch_manager','assign_tasks',true),('branch_manager','manage_sections',true),('branch_manager','manage_templates',true),
 ('branch_manager','manage_users',true),('branch_manager','view_reports',true),('branch_manager','cross_branch',false),
 ('branch_manager','management_tasks',true),
 ('shift_manager','create_tasks',true),('shift_manager','edit_tasks',false),('shift_manager','delete_tasks',false),
 ('shift_manager','assign_tasks',true),('shift_manager','manage_sections',false),('shift_manager','manage_templates',false),
 ('shift_manager','manage_users',false),('shift_manager','view_reports',false),('shift_manager','cross_branch',false),
 ('shift_manager','management_tasks',false),
 ('employee','create_tasks',false),('employee','edit_tasks',false),('employee','delete_tasks',false),
 ('employee','assign_tasks',false),('employee','manage_sections',false),('employee','manage_templates',false),
 ('employee','manage_users',false),('employee','view_reports',false),('employee','cross_branch',false),
 ('employee','management_tasks',false);

INSERT INTO public.branches (id, number, name, city) VALUES
 ('11111111-1111-1111-1111-111111111111','123','Olaya Branch','Riyadh'),
 ('22222222-2222-2222-2222-222222222222','124','Malaz Branch','Riyadh'),
 ('33333333-3333-3333-3333-333333333333','125','Corniche Branch','Jeddah');

INSERT INTO public.shifts (id, branch_id, name, start_time, end_time, allows_overtime, overtime_end_time, sort_order) VALUES
 ('aaaaaaa1-0000-4000-8000-000000000001',NULL,'Opening 6 AM - 3 PM','06:00','15:00',true,'18:00',1),
 ('aaaaaaa1-0000-4000-8000-000000000002',NULL,'Mid 9 AM - 6 PM','09:00','18:00',false,NULL,2),
 ('aaaaaaa1-0000-4000-8000-000000000003',NULL,'Evening 12 PM - 9 PM','12:00','21:00',false,NULL,3),
 ('aaaaaaa1-0000-4000-8000-000000000004',NULL,'Night 6 PM - 6 AM','18:00','06:00',false,NULL,4),
 ('aaaaaaa1-0000-4000-8000-000000000005',NULL,'Closing 9 PM - 6 AM','21:00','06:00',false,NULL,5);

INSERT INTO public.sections (id, branch_id, key, name, icon, color, sort_order, is_default) VALUES
 ('bbbbbbb1-0000-4000-8000-000000000001',NULL,'daily','Daily Tasks','Sun','emerald',1,true),
 ('bbbbbbb1-0000-4000-8000-000000000002',NULL,'weekly','Weekly Tasks','CalendarDays','sky',2,true),
 ('bbbbbbb1-0000-4000-8000-000000000003',NULL,'monthly','Monthly Tasks','Calendar','violet',3,true),
 ('bbbbbbb1-0000-4000-8000-000000000004',NULL,'month_end','Month End','CalendarClock','amber',4,true),
 ('bbbbbbb1-0000-4000-8000-000000000005',NULL,'qa','QA','ShieldCheck','rose',5,true),
 ('bbbbbbb1-0000-4000-8000-000000000006',NULL,'finance','Finance','Banknote','lime',6,true),
 ('bbbbbbb1-0000-4000-8000-000000000007',NULL,'training','Training','GraduationCap','cyan',7,true),
 ('bbbbbbb1-0000-4000-8000-000000000008',NULL,'ppfv','PPFV','ClipboardCheck','orange',8,true);

INSERT INTO public.profiles (id, branch_id, employee_number, full_name, role, shift_id, status, responsibilities) VALUES
 ('ccccccc1-0000-4000-8000-000000000001','11111111-1111-1111-1111-111111111111','1000','Khalid Al-Otaibi','area_manager',NULL,'active','Area operations across Riyadh and Jeddah'),
 ('ccccccc1-0000-4000-8000-000000000002','11111111-1111-1111-1111-111111111111','1001','Jeffrey Santos','branch_manager','aaaaaaa1-0000-4000-8000-000000000002','active','Branch 123 operations'),
 ('ccccccc1-0000-4000-8000-000000000003','11111111-1111-1111-1111-111111111111','1002','Hashem Ali','shift_manager','aaaaaaa1-0000-4000-8000-000000000001','active','Opening shift, 3PO devices'),
 ('ccccccc1-0000-4000-8000-000000000004','11111111-1111-1111-1111-111111111111','1003','Mustafa Kamal','shift_manager','aaaaaaa1-0000-4000-8000-000000000003','active','Evening shift, cash and safe'),
 ('ccccccc1-0000-4000-8000-000000000005','11111111-1111-1111-1111-111111111111','1004','Riyadh Nasser','shift_manager','aaaaaaa1-0000-4000-8000-000000000004','active','Night shift, closing'),
 ('ccccccc1-0000-4000-8000-000000000006','11111111-1111-1111-1111-111111111111','1005','Nasser Faisal','shift_manager','aaaaaaa1-0000-4000-8000-000000000005','annual_leave','Closing shift'),
 ('ccccccc1-0000-4000-8000-000000000007','22222222-2222-2222-2222-222222222222','2001','Omar Zaid','branch_manager','aaaaaaa1-0000-4000-8000-000000000002','active','Branch 124 operations'),
 ('ccccccc1-0000-4000-8000-000000000008','33333333-3333-3333-3333-333333333333','3001','Sami Harbi','branch_manager','aaaaaaa1-0000-4000-8000-000000000002','active','Branch 125 operations');

INSERT INTO public.tasks (branch_id, section_id, title, description, priority, assigned_to, assigned_shift_id, recurrence, interval_minutes, due_time, start_date, is_management, reminder_minutes, created_by) VALUES
 ('11111111-1111-1111-1111-111111111111','bbbbbbb1-0000-4000-8000-000000000001','Check 3PO Devices','HungerStation, Jahez, Mrsool, Keeta: device present, charging, powered on, status Open and receiving orders.','high','ccccccc1-0000-4000-8000-000000000003','aaaaaaa1-0000-4000-8000-000000000001','minutes',180,'06:00',CURRENT_DATE,false,30,'ccccccc1-0000-4000-8000-000000000002'),
 ('11111111-1111-1111-1111-111111111111','bbbbbbb1-0000-4000-8000-000000000001','Check ATM / Self-Service Kiosk','Powered on, paper available, no visible issues, card reader working.','medium',NULL,'aaaaaaa1-0000-4000-8000-000000000001','minutes',240,'07:00',CURRENT_DATE,false,60,'ccccccc1-0000-4000-8000-000000000002'),
 ('11111111-1111-1111-1111-111111111111','bbbbbbb1-0000-4000-8000-000000000001','Back Sink & Sanitizer Check','Soap available, sanitizer available, sink clean and clear.','medium',NULL,NULL,'daily',NULL,'08:00',CURRENT_DATE,false,NULL,'ccccccc1-0000-4000-8000-000000000002'),
 ('11111111-1111-1111-1111-111111111111','bbbbbbb1-0000-4000-8000-000000000001','UHC & Tray Inspection','Check UHC trays, bent or damaged metal parts, tongs cleanliness.','high',NULL,NULL,'daily',NULL,'10:00',CURRENT_DATE,false,NULL,'ccccccc1-0000-4000-8000-000000000002'),
 ('11111111-1111-1111-1111-111111111111','bbbbbbb1-0000-4000-8000-000000000002','Weekly Stock Count','Full weekly inventory count and variance report.','high','ccccccc1-0000-4000-8000-000000000004',NULL,'weekly',NULL,'22:00',CURRENT_DATE,false,NULL,'ccccccc1-0000-4000-8000-000000000002'),
 ('11111111-1111-1111-1111-111111111111','bbbbbbb1-0000-4000-8000-000000000003','Monthly Equipment Review','Review all equipment condition and log issues with photos.','medium',NULL,NULL,'monthly',NULL,'11:00',CURRENT_DATE,false,NULL,'ccccccc1-0000-4000-8000-000000000002'),
 ('11111111-1111-1111-1111-111111111111','bbbbbbb1-0000-4000-8000-000000000004','Close Monthly Attendance Records','Upload attendance records and confirm payroll cut-off.','high','ccccccc1-0000-4000-8000-000000000002',NULL,'monthly',NULL,'12:00',CURRENT_DATE,false,NULL,'ccccccc1-0000-4000-8000-000000000002'),
 ('11111111-1111-1111-1111-111111111111','bbbbbbb1-0000-4000-8000-000000000005','QA Focus - Equipment Legs & Rust','Inspect equipment legs, check rust, paint affected areas. Upload before/after photos.','high',NULL,NULL,'minutes',180,'06:00',CURRENT_DATE,false,60,'ccccccc1-0000-4000-8000-000000000001'),
 ('11111111-1111-1111-1111-111111111111','bbbbbbb1-0000-4000-8000-000000000006','Safe & Cash Drawer Check','Count safe, verify cash drawers, check gift cards and free orders log.','high','ccccccc1-0000-4000-8000-000000000004',NULL,'daily',NULL,'23:00',CURRENT_DATE,false,NULL,'ccccccc1-0000-4000-8000-000000000002'),
 ('11111111-1111-1111-1111-111111111111','bbbbbbb1-0000-4000-8000-000000000006','Camera & Invoice Check','Verify cameras recording and match invoices to deliveries.','medium',NULL,NULL,'daily',NULL,'14:00',CURRENT_DATE,false,NULL,'ccccccc1-0000-4000-8000-000000000002'),
 ('11111111-1111-1111-1111-111111111111','bbbbbbb1-0000-4000-8000-000000000007','New Crew Food Safety Training','Complete food safety module with new crew and record completion.','medium','ccccccc1-0000-4000-8000-000000000005',NULL,'weekly',NULL,'16:00',CURRENT_DATE,false,NULL,'ccccccc1-0000-4000-8000-000000000002'),
 ('11111111-1111-1111-1111-111111111111','bbbbbbb1-0000-4000-8000-000000000008','PPFV Walkthrough','People, Product, Facility, Visit readiness walkthrough.','medium',NULL,NULL,'weekly',NULL,'13:00',CURRENT_DATE,false,NULL,'ccccccc1-0000-4000-8000-000000000002'),
 ('11111111-1111-1111-1111-111111111111','bbbbbbb1-0000-4000-8000-000000000001','Collect Product From Branch 124','One-time pickup of frozen stock from Branch 124.','high','ccccccc1-0000-4000-8000-000000000003',NULL,'once',NULL,'15:00',CURRENT_DATE,false,NULL,'ccccccc1-0000-4000-8000-000000000002'),
 ('11111111-1111-1111-1111-111111111111','bbbbbbb1-0000-4000-8000-000000000005','Prepare Branch For Upcoming QA Visit','Full readiness check before the area QA visit. Report back with photos.','high','ccccccc1-0000-4000-8000-000000000002',NULL,'daily',NULL,'09:00',CURRENT_DATE,true,NULL,'ccccccc1-0000-4000-8000-000000000001'),
 ('22222222-2222-2222-2222-222222222222','bbbbbbb1-0000-4000-8000-000000000001','Check 3PO Devices','Delivery tablets present, charged and receiving orders.','high',NULL,NULL,'minutes',180,'06:00',CURRENT_DATE,false,30,'ccccccc1-0000-4000-8000-000000000007'),
 ('22222222-2222-2222-2222-222222222222','bbbbbbb1-0000-4000-8000-000000000006','Safe & Cash Drawer Check','Count safe and verify drawers.','high',NULL,NULL,'daily',NULL,'23:00',CURRENT_DATE,false,NULL,'ccccccc1-0000-4000-8000-000000000007'),
 ('33333333-3333-3333-3333-333333333333','bbbbbbb1-0000-4000-8000-000000000001','Restaurant Cleanliness Round','Dining area, restrooms and back of house cleanliness round.','medium',NULL,NULL,'minutes',240,'07:00',CURRENT_DATE,false,NULL,'ccccccc1-0000-4000-8000-000000000008');

INSERT INTO public.task_templates (branch_id, name, description, payload, created_by) VALUES
 (NULL,'Opening Shift Template','Standard opening checks for any branch','[{"title":"Unlock and alarm off","priority":"high"},{"title":"Check 3PO devices","priority":"high"},{"title":"Equipment start-up check","priority":"medium"},{"title":"Sanitizer and soap stations","priority":"medium"}]'::jsonb,'ccccccc1-0000-4000-8000-000000000001'),
 (NULL,'Closing Shift Template','Standard closing checks','[{"title":"Safe count","priority":"high"},{"title":"Deep clean UHC","priority":"medium"},{"title":"Waste log","priority":"low"},{"title":"Lock up and alarm on","priority":"high"}]'::jsonb,'ccccccc1-0000-4000-8000-000000000001'),
 (NULL,'QA Visit Preparation','Readiness checklist before a QA visit','[{"title":"Inspect equipment legs and rust","priority":"high"},{"title":"UHC trays and tongs","priority":"high"},{"title":"Temperature logs complete","priority":"high"},{"title":"Staff grooming check","priority":"medium"}]'::jsonb,'ccccccc1-0000-4000-8000-000000000001');

CREATE POLICY "task photos read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'task-photos');
CREATE POLICY "task photos upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'task-photos');
CREATE POLICY "task photos update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'task-photos');
