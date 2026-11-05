with open('frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Add imports
old_imports = "import CaregiverDashboard from './pages/CaregiverDashboard';"
new_imports = "import CaregiverDashboard from './pages/CaregiverPortal';\nimport PatientScheduleView from './components/PatientScheduleView';"

if old_imports in text:
    text = text.replace(old_imports, new_imports)

# Add route for patient_schedule
old_route = "  } else if (view === 'tracking') {\n    content = <PatientTracking userRole='family' />;\n  }"
new_route = "  } else if (view === 'tracking') {\n    content = <PatientTracking userRole='family' />;\n  } else if (view === 'patient_schedule') {\n    content = <PatientScheduleView />;\n  }"

if old_route in text:
    text = text.replace(old_route, new_route)

with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("SUCCESSFULLY WIRED CAREGIVER PORTAL & PATIENT SCHEDULE!")

