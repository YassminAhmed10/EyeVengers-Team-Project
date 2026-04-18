# Global Search Implementation Plan

## Information Gathered:

### Current State:
1. **Header.jsx** - Already has a search bar with `searchQuery` state passed from App.jsx, but it's not functional
2. **InventoryManagement.jsx** - Has local search for medicines by name/manufacturer
3. **CustomerManagement.jsx** - Has local search for customers by name/email/phone
4. **PrescriptionProcessing.jsx** - Has local search for prescriptions by patient name/ID
5. **App.jsx** - Manages global `searchQuery` state

### Issue:
The Header has a search bar but it doesn't do anything. Each page has its own independent search functionality.

## Plan:

### Step 1: Create GlobalSearchResults Component
- Create a new component `front_end/src/Common/GlobalSearchResults.jsx`
- This component will display categorized search results
- Categories: Medicines, Prescriptions, Customers
- Show matching results from all three data sources
- Include navigation to view full results in each section

### Step 2: Update Header.jsx
- Add logic to show/hide search results dropdown
- Integrate the GlobalSearchResults component
- Handle click outside to close results
- Add keyboard navigation support

### Step 3: Update App.jsx
- Pass search results data to Header (or make it fetch directly)
- Ensure search triggers when user types

### Step 4: Create unified data access
- Export medicines, customers, and prescriptions from mockData.js for global search

## Files to be Edited:
1. `front_end/src/data/mockData.js` - Export data for global access
2. `front_end/src/Common/GlobalSearchResults.jsx` - NEW FILE
3. `front_end/src/components/layout/Header.jsx` - Add dropdown functionality
4. `front_end/src/App.jsx` - Pass data to search component

## Followup Steps:
- Test the search functionality
- Verify search works for all three categories
- Ensure responsive design

