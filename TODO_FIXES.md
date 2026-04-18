# Fixes TODO List

## Task Summary:
Fix 4 main issues:
1. AI Assistant - make it functional
2. Prescriptions - link to existing customers, auto-add new customers
3. Dashboard Statistics - fix numbers and visualizations
4. Inventory Stock - decrease stock when items are sold

## Steps:
- [ ] 1. Fix AI Assistant button onClick and pass data properly
- [ ] 2. Fix AddPrescriptionModal to accept customers and auto-add new customers
- [ ] 3. Fix Dashboard stats calculations
- [ ] 4. Fix stock update in App.jsx addSale callback

## Files to Edit:
1. front_end/src/Common/PharmacyAssistant.jsx - Fix onClick and data
2. front_end/src/Prescriptions/AddPrescriptionModal.jsx - Add customer selection
3. front_end/src/Prescriptions/PrescriptionProcessing.jsx - Pass customers to modal
4. front_end/src/App.jsx - Fix addSale callback closure issue and stock update
5. front_end/src/Dashboard/Dashboard.jsx - Fix stats calculations

## Dependencies:
- All changes are in front_end/src/
- No new packages needed

