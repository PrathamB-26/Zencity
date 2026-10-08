import random
import datetime

# Fixed bcrypt hash for password 'password123' (10 rounds standard bcrypt)
# Generated using bcrypt.hashpw(b'password123', bcrypt.gensalt(10))
BCRYPT_PASSWORD_HASH = "$2b$10$epRfZG9Ghy0v7s4/J355i.p9UuH7iFpY.V5qGg1n33uG1c4y0w9G6"

def generate_seed_sql():
    sql = []
    sql.append("-- ============================================================================")
    sql.append("-- ZENCITY: SMART CITY COMPLAINT & ANALYTICS PLATFORM")
    sql.append("-- SYNTHETIC SEED DATA (POSTGRESQL)")
    sql.append("-- ============================================================================")
    sql.append("-- IMPORTANT: This file contains realistic synthetic demo data representing")
    sql.append("-- civic complaints, departments, officers, citizens, status history, and feedback.")
    sql.append("-- Default password for all seed accounts is: password123")
    sql.append("-- ============================================================================\n")

    sql.append("BEGIN;\n")

    # 1. Departments
    sql.append("-- ----------------------------------------------------------------------------")
    sql.append("-- 1. SEED DEPARTMENTS")
    sql.append("-- ----------------------------------------------------------------------------")
    departments = [
        (1, "Road Department", "Maintenance of municipal roads, asphalt, footpaths, and signage"),
        (2, "Water Department", "Municipal potable water supply pipelines, leakage, and metering"),
        (3, "Electricity Department", "Street lighting, electrical distribution poles, and civic power lines"),
        (4, "Waste Management", "Solid waste management, garbage collection, bin clearing, and sanitation"),
        (5, "Drainage Department", "Stormwater drains, sewerage pipelines, and flood mitigation"),
        (6, "Environment Department", "Parks, horticulture, fallen tree clearance, and urban green spaces")
    ]
    sql.append("INSERT INTO departments (department_id, department_name, description) VALUES")
    dept_values = [f"({d[0]}, '{d[1]}', '{d[2]}')" for d in departments]
    sql.append(",\n".join(dept_values) + ";")
    sql.append("SELECT setval('departments_department_id_seq', (SELECT MAX(department_id) FROM departments));\n")

    # 2. Wards
    sql.append("-- ----------------------------------------------------------------------------")
    sql.append("-- 2. SEED WARDS")
    sql.append("-- ----------------------------------------------------------------------------")
    wards = [
        (1, "Ward 1 - Central Market", "Central Zone", 18.5204, 73.8567),
        (2, "Ward 2 - Riverside North", "North Zone", 18.5410, 73.8680),
        (3, "Ward 3 - Green Meadows", "West Zone", 18.5080, 73.8050),
        (4, "Ward 4 - Tech Corridor", "West Zone", 18.5590, 73.7860),
        (5, "Ward 5 - Industrial Belt", "East Zone", 18.5080, 73.9260),
        (6, "Ward 6 - Airport Boulevard", "North Zone", 18.5720, 73.9100),
        (7, "Ward 7 - Heritage Quarter", "Central Zone", 18.5140, 73.8510),
        (8, "Ward 8 - South Ridge", "South Zone", 18.4520, 73.8610),
        (9, "Ward 9 - Lake District", "South Zone", 18.4680, 73.8340),
        (10, "Ward 10 - Metro Junction", "Central Zone", 18.5310, 73.8440),
        (11, "Ward 11 - University Heights", "West Zone", 18.5360, 73.8290),
        (12, "Ward 12 - Eastern Suburbs", "East Zone", 18.5420, 73.9450)
    ]
    sql.append("INSERT INTO wards (ward_id, ward_name, zone, center_latitude, center_longitude) VALUES")
    ward_values = [f"({w[0]}, '{w[1]}', '{w[2]}', {w[3]}, {w[4]})" for w in wards]
    sql.append(",\n".join(ward_values) + ";")
    sql.append("SELECT setval('wards_ward_id_seq', (SELECT MAX(ward_id) FROM wards));\n")

    # 3. Categories
    sql.append("-- ----------------------------------------------------------------------------")
    sql.append("-- 3. SEED CATEGORIES (14 Active Categories)")
    sql.append("-- ----------------------------------------------------------------------------")
    categories = [
        (1, "Pothole", "Infrastructure", "Road surface depression or asphalt cracking", 1),
        (2, "Damaged Road", "Infrastructure", "Extensive tar erosion or broken street surface", 1),
        (3, "Damaged Footpath", "Infrastructure", "Broken sidewalk pavers or pedestrian walkway hazards", 1),
        (4, "Traffic Signal", "Infrastructure", "Non-functional signal lights or countdown timer failure", 1),
        (5, "Water Leakage", "Water and Drainage", "Pipeline rupture or pressurized water spurting onto streets", 2),
        (6, "Water Supply Interruption", "Water and Drainage", "No potable water delivery or low pressure in locality", 2),
        (7, "Drainage Blockage", "Water and Drainage", "Clogged sewer lines or foul backflow into gutters", 5),
        (8, "Waterlogging", "Water and Drainage", "Monsoon stormwater pooling causing traffic gridlock", 5),
        (9, "Garbage Not Collected", "Waste Management", "Scheduled municipal truck skipped residential pickup", 4),
        (10, "Overflowing Garbage Bin", "Waste Management", "Public dustbin spilling onto road", 4),
        (11, "Street Light Not Working", "Electricity and Lighting", "Dark street lamp or flickering sodium/LED luminaire", 3),
        (12, "Fallen Tree", "Environment", "Fallen trunk or large branches blocking pathway/wires", 6),
        (13, "Stray Animals", "Public Safety and Other", "Aggressive packs or cattle hindering traffic flow", 4),
        (14, "Other Civic Problems", "Public Safety and Other", "General municipal nuisance not covered above", 1)
    ]
    sql.append("INSERT INTO categories (category_id, category_name, category_group, description, default_department_id, is_active) VALUES")
    cat_values = [f"({c[0]}, '{c[1]}', '{c[2]}', '{c[3]}', {c[4]}, true)" for c in categories]
    sql.append(",\n".join(cat_values) + ";")
    sql.append("SELECT setval('categories_category_id_seq', (SELECT MAX(category_id) FROM categories));\n")

    # Optional 18 categories commented out
    sql.append("-- Optional categories for future extension (Uncomment to enable all 32):")
    sql.append("/*")
    sql.append("INSERT INTO categories (category_name, category_group, description, default_department_id) VALUES")
    sql.append("('Damaged/missing road signs', 'Infrastructure', 'Signboard broken or obscured', 1),")
    sql.append("('Parking problems', 'Infrastructure', 'Illegal parking blocking pedestrian passage', 1),")
    sql.append("('Bus stop problems', 'Infrastructure', 'Damaged commuter shelter', 1),")
    sql.append("('Damaged public infrastructure', 'Infrastructure', 'Broken railings or divider barriers', 1),")
    sql.append("('Sewerage problems', 'Water and Drainage', 'Sewer overflow onto footpath', 5),")
    sql.append("('Contaminated water', 'Water and Drainage', 'Discolored or foul-smelling tap water', 2),")
    sql.append("('Open manholes', 'Water and Drainage', 'Hazardous missing or broken manhole cover', 5),")
    sql.append("('Illegal dumping', 'Waste Management', 'Construction debris or industrial dumping', 4),")
    sql.append("('Public toilet problems', 'Waste Management', 'Sanitation or plumbing failure in public toilet', 4),")
    sql.append("('Damaged light pole', 'Electricity and Lighting', 'Leaning pole or exposed electrical base', 3),")
    sql.append("('Electrical hazards', 'Electricity and Lighting', 'Sparking wires or hanging live cable', 3),")
    sql.append("('Tree trimming requirement', 'Environment', 'Overgrown branches obstructing cables or view', 6),")
    sql.append("('Air pollution', 'Environment', 'Dust from construction or smoke emissions', 6),")
    sql.append("('Noise pollution', 'Environment', 'Loud generator or unauthorized loudspeakers', 6),")
    sql.append("('Open burning', 'Environment', 'Burning leaves or garbage in open space', 6),")
    sql.append("('Encroachment', 'Public Safety and Other', 'Footpath vendor obstruction', 1),")
    sql.append("('Public park maintenance', 'Public Safety and Other', 'Broken play equipment or unkempt turf', 6),")
    sql.append("('Public property damage', 'Public Safety and Other', 'Vandalism or defaced civic structure', 1);")
    sql.append("*/\n")

    # 4. Users
    sql.append("-- ----------------------------------------------------------------------------")
    sql.append("-- 4. SEED USERS (1 Admin, 12 Officers across Departments, 40 Citizens)")
    sql.append("-- ----------------------------------------------------------------------------")
    users = []
    # User 1: Admin
    users.append((1, "Vikram Malhotra", "admin@zencity.local", "+91 98765 00001", BCRYPT_PASSWORD_HASH, "ADMIN", "NULL"))

    # Officers (User IDs 2 to 13)
    officer_data = [
        (2, "Rajesh Shinde", "officer.road1@zencity.local", "+91 98765 00002", 1),
        (3, "Anita Deshmukh", "officer.road2@zencity.local", "+91 98765 00003", 1),
        (4, "Sunil Kulkarni", "officer.water1@zencity.local", "+91 98765 00004", 2),
        (5, "Pooja Patil", "officer.water2@zencity.local", "+91 98765 00005", 2),
        (6, "Mahesh Joshi", "officer.elec1@zencity.local", "+91 98765 00006", 3),
        (7, "Sneha More", "officer.elec2@zencity.local", "+91 98765 00007", 3),
        (8, "Amit Gaikwad", "officer.waste1@zencity.local", "+91 98765 00008", 4),
        (9, "Kavita Chavan", "officer.waste2@zencity.local", "+91 98765 00009", 4),
        (10, "Suresh Jadhav", "officer.drainage1@zencity.local", "+91 98765 00010", 5),
        (11, "Deepa Pawar", "officer.drainage2@zencity.local", "+91 98765 00011", 5),
        (12, "Rohan Thorat", "officer.env1@zencity.local", "+91 98765 00012", 6),
        (13, "Pallavi Rane", "officer.env2@zencity.local", "+91 98765 00013", 6)
    ]
    for uid, name, email, phone, did in officer_data:
        users.append((uid, name, email, phone, BCRYPT_PASSWORD_HASH, "OFFICER", str(did)))

    # Citizens (User IDs 14 to 53)
    citizen_names = [
        "Aarav Sharma", "Diya Mehta", "Ishaan Verma", "Ananya Iyer", "Aditya Nair",
        "Riya Sen", "Kabir Rao", "Tanvi Bhatia", "Devendra Roy", "Meera Pillai",
        "Arjun Kapoor", "Neha Saxena", "Siddharth Jain", "Priyanka Das", "Gaurav Agarwal",
        "Komal Hegde", "Varun Chopra", "Shweta Tiwari", "Nikhil Bansal", "Swati Pandey",
        "Akash Mukherjee", "Pooja Reddy", "Manish Pandey", "Shruti Gupta", "Kunal Sethi",
        "Bhavna Shah", "Rahul Khanna", "Simran Gill", "Harsh Patel", "Alisha Menon",
        "Tarun Bajaj", "Preeti Mathur", "Sameer Chawla", "Divya Nambiar", "Vivek Sengupta",
        "Monika Kaushik", "Anand Swaminathan", "Isha Bhattacharya", "Chetan Mahajan", "Radhika Singhania"
    ]
    for i, cname in enumerate(citizen_names):
        uid = 14 + i
        email = f"citizen{i+1}@zencity.local"
        phone = f"+91 98200 {10000 + i:05d}"
        users.append((uid, cname, email, phone, BCRYPT_PASSWORD_HASH, "CITIZEN", "NULL"))

    sql.append("INSERT INTO users (user_id, name, email, phone, password_hash, role, department_id, is_active) VALUES")
    user_values = [f"({u[0]}, '{u[1]}', '{u[2]}', '{u[3]}', '{u[4]}', '{u[5]}', {u[6]}, true)" for u in users]
    sql.append(",\n".join(user_values) + ";")
    sql.append("SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));\n")

    # 5. Complaints (1100 synthetic complaints spanning from Oct 2024 to Oct 2026)
    sql.append("-- ----------------------------------------------------------------------------")
    sql.append("-- 5. SEED COMPLAINTS (1,100 Realistic Synthetic Complaints with Seasonality)")
    sql.append("-- ----------------------------------------------------------------------------")
    
    random.seed(42)
    base_start = datetime.datetime(2024, 11, 1, 8, 0, 0)
    total_days = 700

    dept_officers = {
        1: [2, 3],
        2: [4, 5],
        3: [6, 7],
        4: [8, 9],
        5: [10, 11],
        6: [12, 13]
    }

    # Department default resolution time ranges (hours)
    dept_res_hours = {
        1: (24, 140),  # Road (medium-slow)
        2: (8, 48),    # Water (fast-urgent)
        3: (4, 36),    # Electricity (fast)
        4: (6, 30),    # Waste (fast)
        5: (18, 96),   # Drainage (medium)
        6: (12, 72)    # Environment (medium)
    }

    complaint_titles = {
        1: ["Deep pothole causing bike skidding", "Multiple potholes after rain", "Large crater in lane 3", "Dangerous road depression"],
        2: ["Tar eroded across 100 meters", "Cracked asphalt on main arterial road", "Uneven road level near junction", "Gravel scattered on highway lane"],
        3: ["Broken pavers on pedestrian pathway", "Footpath collapsed into ditch", "Tiles missing near bus queue", "Hazardous curb stones lying dislodged"],
        4: ["Traffic signal blinking yellow permanently", "Red light bulb fused at crossroad", "Timer stuck at 00 seconds", "All signal lights off during rush hour"],
        5: ["Main supply pipe burst flooding street", "Drinking water gushing from underground pipe", "Continuous seepage near building entrance", "Pipeline fracture near valve"],
        6: ["No water supply for past 3 days", "Extremely low tap pressure across society", "Erratic morning supply timings", "Zero water pressure on 2nd floor"],
        7: ["Sewer line choked and overflowing", "Gutters emitting unbearable odor", "Sewage backflow into residential basements", "Manhole overflowing with sludge"],
        8: ["Severe waterlogging under railway bridge", "Rainwater knee-deep at market junction", "Road submerged after 1 hour downpour", "Water trapped due to choked stormwater inlets"],
        9: ["Garbage van missed pickup for 4 consecutive days", "Rotting household waste piling up at corner", "Commercial waste dumped on sidewalk", "Door-to-door sanitation truck not arriving"],
        10: ["Community dumper overflowing onto street", "Cattle and stray dogs scattering bin garbage", "Metal dustbin broken and spilling waste", "Overfilled bin obstructing sidewalk"],
        11: ["Streetlight dark for 1 week", "Flickering high-voltage pole light", "Entire street dark between poles 12 and 18", "LED fixture hanging precariously"],
        12: ["Large banyan branch snapped on road", "Fallen gulmohar tree blocking car passage", "Uprooted tree leaning dangerously over power lines", "Heavy branch broken during storm"],
        13: ["Aggressive pack of stray dogs barking at night", "Stray cattle squatting on arterial road", "Rabid dog spotted near school gate", "Stray animal herd hindering morning traffic"],
        14: ["Broken median railing", "Illegal banner frame obstructing corner view", "Damaged public bench in promenade", "Civic notice board vandalized"]
    }

    statuses_distribution = ["RESOLVED", "RESOLVED", "RESOLVED", "RESOLVED", "CLOSED", "CLOSED", "IN_PROGRESS", "ASSIGNED", "SUBMITTED", "REJECTED"]
    priorities = ["LOW", "MEDIUM", "MEDIUM", "HIGH", "CRITICAL"]

    complaint_rows = []
    history_rows = []
    feedback_rows = []
    notification_rows = []

    history_id = 1
    feedback_id = 1
    notif_id = 1

    for cid in range(1, 1101):
        # Pick date
        day_offset = random.randint(0, total_days)
        hour_offset = random.randint(0, 23)
        minute_offset = random.randint(0, 59)
        c_time = base_start + datetime.timedelta(days=day_offset, hours=hour_offset, minutes=minute_offset)
        month = c_time.month

        # Seasonal variation: monsoon (June to Sept) has higher waterlogging & drainage & potholes
        if month in [6, 7, 8, 9] and random.random() < 0.50:
            cat_id = random.choice([1, 2, 7, 8, 5])
        else:
            cat_id = random.randint(1, 14)

        cat_info = categories[cat_id - 1]
        dept_id = cat_info[4]
        user_id = random.randint(14, 53)
        ward_id = random.randint(1, 12)
        ward_center = wards[ward_id - 1]

        # Add small spatial variance
        lat = round(ward_center[3] + random.uniform(-0.015, 0.015), 6)
        lon = round(ward_center[4] + random.uniform(-0.015, 0.015), 6)

        title = random.choice(complaint_titles[cat_id])
        desc = f"{title}. Please dispatch municipal maintenance team to inspect and resolve at the earliest."
        location_text = f"Near {ward_center[1].split(' - ')[1]} Landmark, Sector {random.randint(1, 12)}"

        priority = random.choice(priorities)
        if cat_id in [4, 5, 8, 12]:
            priority = random.choice(["HIGH", "CRITICAL"])

        # SLA calculation
        sla_hours = 24 if priority == "CRITICAL" else (48 if priority == "HIGH" else (96 if priority == "MEDIUM" else 168))
        due_date = c_time + datetime.timedelta(hours=sla_hours)

        # Status logic: recent complaints are more likely pending/in progress
        days_ago = (datetime.datetime(2026, 10, 8) - c_time).days
        if days_ago < 5:
            status = random.choice(["SUBMITTED", "ASSIGNED", "IN_PROGRESS"])
        elif days_ago < 20:
            status = random.choice(["ASSIGNED", "IN_PROGRESS", "RESOLVED"])
        else:
            status = random.choice(statuses_distribution)

        assigned_officer = random.choice(dept_officers[dept_id]) if status in ["ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"] else None

        resolved_at = None
        if status in ["RESOLVED", "CLOSED"]:
            min_h, max_h = dept_res_hours[dept_id]
            # Priority resolves faster
            factor = 0.5 if priority == "CRITICAL" else (0.75 if priority == "HIGH" else 1.0)
            # Add occasional outlier (5% probability)
            if random.random() < 0.05:
                res_h = random.randint(int(max_h * 2), int(max_h * 4))
            else:
                res_h = int(random.randint(min_h, max_h) * factor)
            resolved_at = c_time + datetime.timedelta(hours=res_h)

        # Build complaint tuple
        officer_str = str(assigned_officer) if assigned_officer else "NULL"
        resolved_str = f"'{resolved_at.strftime('%Y-%m-%d %H:%M:%S%z')}+05:30'" if resolved_at else "NULL"
        due_str = f"'{due_date.strftime('%Y-%m-%d %H:%M:%S%z')}+05:30'"
        created_str = f"'{c_time.strftime('%Y-%m-%d %H:%M:%S%z')}+05:30'"
        image_name = f"'/uploads/sample_complaint_{((cid - 1) % 10) + 1}.jpg'"

        complaint_rows.append(
            f"({cid}, {user_id}, {cat_id}, {dept_id}, {ward_id}, {officer_str}, '{title}', '{desc}', {image_name}, '{location_text}', {lat}, {lon}, '{priority}', '{status}', {due_str}, {created_str}, {resolved_str})"
        )

        # Generate History records
        # Step 1: SUBMITTED
        history_rows.append(f"({history_id}, {cid}, NULL, 'SUBMITTED', {user_id}, {created_str}, 'Complaint registered by citizen.')")
        history_id += 1

        if status in ["ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"]:
            assign_time = c_time + datetime.timedelta(hours=random.randint(2, 8))
            history_rows.append(f"({history_id}, {cid}, 'SUBMITTED', 'ASSIGNED', 1, '{assign_time.strftime('%Y-%m-%d %H:%M:%S%z')}+05:30', 'Assigned to {cat_info[1]} division officer.')")
            history_id += 1

        if status in ["IN_PROGRESS", "RESOLVED", "CLOSED"]:
            inprog_time = c_time + datetime.timedelta(hours=random.randint(8, 20))
            history_rows.append(f"({history_id}, {cid}, 'ASSIGNED', 'IN_PROGRESS', {officer_str}, '{inprog_time.strftime('%Y-%m-%d %H:%M:%S%z')}+05:30', 'Work crew dispatched to location.')")
            history_id += 1

        if status in ["RESOLVED", "CLOSED"]:
            res_remarks = "Civic maintenance completed. Tested and verified on-site."
            history_rows.append(f"({history_id}, {cid}, 'IN_PROGRESS', 'RESOLVED', {officer_str}, {resolved_str}, '{res_remarks}')")
            history_id += 1

        if status == "CLOSED":
            close_time = resolved_at + datetime.timedelta(hours=random.randint(12, 48))
            history_rows.append(f"({history_id}, {cid}, 'RESOLVED', 'CLOSED', {user_id}, '{close_time.strftime('%Y-%m-%d %H:%M:%S%z')}+05:30', 'Citizen verified resolution and closed ticket.')")
            history_id += 1

        if status == "REJECTED":
            rej_time = c_time + datetime.timedelta(hours=random.randint(4, 18))
            history_rows.append(f"({history_id}, {cid}, 'SUBMITTED', 'REJECTED', 1, '{rej_time.strftime('%Y-%m-%d %H:%M:%S%z')}+05:30', 'Duplicate report or out of municipal jurisdiction.')")
            history_id += 1

        # Generate Feedback if resolved or closed (80% of resolved complaints have feedback)
        if status in ["RESOLVED", "CLOSED"] and random.random() < 0.80:
            rating = random.choices([5, 4, 3, 2, 1], weights=[45, 30, 15, 6, 4])[0]
            comments = {
                5: "Excellent and rapid resolution by municipal team. Very satisfied!",
                4: "Prompt response. Problem was fixed cleanly.",
                3: "Satisfactory resolution, took slightly longer than expected.",
                2: "Work done was mediocre. Required multiple follow-ups.",
                1: "Poor resolution quality. The repair is already deteriorating."
            }
            f_comment = comments[rating]
            f_time = resolved_at + datetime.timedelta(hours=random.randint(2, 24))
            feedback_rows.append(
                f"({feedback_id}, {cid}, {user_id}, {rating}, '{f_comment}', '{f_time.strftime('%Y-%m-%d %H:%M:%S%z')}+05:30')"
            )
            feedback_id += 1

        # Generate notifications
        if cid % 3 == 0:
            n_msg = f"Your complaint #{cid} '{title}' has been updated to {status}."
            notification_rows.append(
                f"({notif_id}, {user_id}, {cid}, 'STATUS_UPDATE', '{n_msg}', {str(status in ['RESOLVED', 'CLOSED']).lower()}, {created_str})"
            )
            notif_id += 1

    # Chunk complaints insertion (PostgreSQL supports bulk, but chunking into 200 rows is clean)
    sql.append("INSERT INTO complaints (complaint_id, user_id, category_id, department_id, ward_id, assigned_officer_id, title, description, image, location_text, latitude, longitude, priority, status, due_date, created_at, resolved_at) VALUES")
    for idx in range(0, len(complaint_rows), 250):
        chunk = complaint_rows[idx:idx+250]
        if idx > 0:
            sql.append("INSERT INTO complaints (complaint_id, user_id, category_id, department_id, ward_id, assigned_officer_id, title, description, image, location_text, latitude, longitude, priority, status, due_date, created_at, resolved_at) VALUES")
        sql.append(",\n".join(chunk) + ";\n")

    sql.append("SELECT setval('complaints_complaint_id_seq', (SELECT MAX(complaint_id) FROM complaints));\n")

    # Insert Status History
    sql.append("-- ----------------------------------------------------------------------------")
    sql.append("-- 6. SEED COMPLAINT STATUS HISTORY")
    sql.append("-- ----------------------------------------------------------------------------")
    for idx in range(0, len(history_rows), 250):
        chunk = history_rows[idx:idx+250]
        sql.append("INSERT INTO complaint_status_history (history_id, complaint_id, old_status, new_status, changed_by, changed_at, remarks) VALUES")
        sql.append(",\n".join(chunk) + ";\n")
    sql.append("SELECT setval('complaint_status_history_history_id_seq', (SELECT MAX(history_id) FROM complaint_status_history));\n")

    # Insert Feedback
    sql.append("-- ----------------------------------------------------------------------------")
    sql.append("-- 7. SEED FEEDBACK")
    sql.append("-- ----------------------------------------------------------------------------")
    for idx in range(0, len(feedback_rows), 250):
        chunk = feedback_rows[idx:idx+250]
        sql.append("INSERT INTO feedback (feedback_id, complaint_id, user_id, rating, comment, created_at) VALUES")
        sql.append(",\n".join(chunk) + ";\n")
    sql.append("SELECT setval('feedback_feedback_id_seq', (SELECT MAX(feedback_id) FROM feedback));\n")

    # Insert Notifications
    sql.append("-- ----------------------------------------------------------------------------")
    sql.append("-- 8. SEED NOTIFICATIONS")
    sql.append("-- ----------------------------------------------------------------------------")
    for idx in range(0, len(notification_rows), 250):
        chunk = notification_rows[idx:idx+250]
        sql.append("INSERT INTO notifications (notification_id, user_id, complaint_id, type, message, is_read, created_at) VALUES")
        sql.append(",\n".join(chunk) + ";\n")
    sql.append("SELECT setval('notifications_notification_id_seq', (SELECT MAX(notification_id) FROM notifications));\n")

    sql.append("COMMIT;\n")

    with open("database/seed.sql", "w", encoding="utf-8") as f:
        f.write("\n".join(sql))
    print(f"Successfully generated database/seed.sql with {len(complaint_rows)} complaints, {len(history_rows)} history rows, and {len(feedback_rows)} feedback entries.")

if __name__ == "__main__":
    generate_seed_sql()
