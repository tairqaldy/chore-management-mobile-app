# Test Plan - Chore Management Mobile App

## 📋 Overview

This test plan helps you verify that all features of the chore management app work correctly. Follow each step and check off what works.

---

## Pre-Testing Setup

### Step 1: Install and Launch
- [ ] Install the app on your device/emulator (Expo Go)
- [ ] Launch the app successfully
- [ ] App opens without crashes (via QR code)

### Step 2: Test Environment (give paper and pen to all users/write down for them)
- [ ] Note your device/emulator type: ________________
- [ ] Note your app version (MVP 1.0.0): ________________
- [ ] Note the date of testing (04.12.25): ________________

---

## 🔐 Authentication Testing

Half of the group desides on who will be registering as a host, and other half registers as a tenants. (optional, can be done every user go through each step, which is better)

*We disabled 2FA for better testing experience as we want it to go well as we had system in which you cant register with accounts without an access to real email to confirm registration before usage.

### Step 3: Sign Up as Host
- 3.1 [ ] Navigate to sign up screen
- 3.2 [ ] Create a new host account (to test: no spaces in name, no dashes)
- 3.3 [ ] Sign up completes successfully
- 3.4 [ ] User is redirected to create house screen

### Step 4: Sign Up as Tenant
- 4.1 [ ] Sign out (if logged in)
- 4.2 [ ] Create a new tenant account
- 4.3 [ ] Sign up completes successfully
- 4.4 [ ] User is redirected to join house screen

### Step 5: Sign In
- [ ] Sign out (if logged in)
- [ ] Sign in with existing credentials
- [ ] Sign in works correctly
- [ ] User is redirected to appropriate screen (dashboard/join house)

### Step 6: Sign Out
- [ ] Click "Sign Out" button
- [ ] User is logged out successfully
- [ ] User is redirected to welcome/login screen

---

## 🏠 House Management Testing

### Step 7: Create House (Host Only)
- [ ] As a host, create a new house
- [ ] Enter house name
- [ ] Enter house description (optional)
- [ ] Set maximum tenants
- [ ] House is created successfully
- [ ] Host is redirected to dashboard
- [ ] House name appears on dashboard

### Step 8: Join House (Tenant Only)
- [ ] As a tenant, view available houses
- [ ] See list of houses with details (name, description, tenant count)
- [ ] Tap on a house to join
- [ ] House join is successful
- [ ] Tenant is redirected to dashboard
- [ ] House name appears on dashboard

### Step 9: Leave House (Tenant Only)
- [ ] As a tenant, click "Leave House" button
- [ ] Confirm leaving the house
- [ ] Successfully leave the house
- [ ] Redirected to join house screen

---

## 📝 Chore Management Testing

### Step 10: Add Chore (All Users)
- [ ] Click "ADD TASK" or "ADD" button
- [ ] Enter chore name
- [ ] Enter chore description (optional)
- [ ] Set due date (if applicable)
- [ ] Submit the chore
- [ ] Chore appears in the chores list
- [ ] Chore shows correct status (unassigned/assigned)

### Step 11: Assign Chore (Host Only)
- [ ] As a host, view unassigned chore
- [ ] Click assign button/action
- [ ] Select a tenant from the list
- [ ] Assign chore to tenant
- [ ] Chore shows as assigned to selected tenant
- [ ] Assigned tenant can see the chore in their list

### Step 12: Complete Chore (All Users)
- [ ] View an assigned chore
- [ ] Mark chore as complete
- [ ] Chore status changes to completed
- [ ] Completed chore shows appropriate visual indicator

### Step 13: Archive Chore (All Users)
- [ ] Swipe left on a completed chore (or use archive action)
- [ ] Chore is archived successfully
- [ ] Chore disappears from main chores list
- [ ] Chore appears in archive view

---

## 📦 Archive View Testing

### Step 14: View Archive
- [ ] Click "Archive" button on dashboard
- [ ] Archive screen opens
- [ ] All archived chores are displayed
- [ ] Archived chores show correct information

### Step 15: Archive Refresh
- [ ] Pull down to refresh archive
- [ ] Archive list updates correctly
- [ ] Loading indicator appears during refresh

---

## 👥 Tenant Management Testing (Host Only)

### Step 16: View Tenants
- [ ] As a host, view tenant list
- [ ] All tenants in the house are displayed
- [ ] Tenant information is correct (username, etc.)

### Step 17: Tenant List Refresh
- [ ] Pull down to refresh tenant list
- [ ] Tenant list updates correctly

---

## 🔄 General Functionality Testing

### Step 18: Pull to Refresh
- [ ] On dashboard, pull down to refresh
- [ ] All data refreshes (chores, tenants, house info)
- [ ] Loading indicator appears
- [ ] Data updates correctly after refresh

### Step 19: Role Indicators
- [ ] Host sees "HOST" indicator
- [ ] Tenant sees "TENANT" indicator
- [ ] Role indicator is visible and correct

### Step 20: Navigation
- [ ] Navigate between screens smoothly
- [ ] Back button works correctly
- [ ] No navigation errors or crashes

---

## 🐛 Error Handling Testing

### Step 21: Network Errors
- [ ] Test with poor/no internet connection
- [ ] App shows appropriate error messages
- [ ] App doesn't crash on network errors

### Step 22: Invalid Input
- [ ] Try to submit empty chore name
- [ ] Try to join house when already in a house
- [ ] Try invalid actions
- [ ] Appropriate error messages are shown

### Step 23: Edge Cases
- [ ] Test with maximum number of tenants
- [ ] Test with no chores
- [ ] Test with no tenants (host only)
- [ ] App handles edge cases gracefully

---

## 📱 UI/UX Testing

### Step 24: Visual Design
- [ ] All text is readable
- [ ] Buttons are clearly visible and clickable
- [ ] Colors and styling are consistent
- [ ] Icons display correctly

### Step 25: Responsiveness
- [ ] App works on different screen sizes
- [ ] Content doesn't overflow
- [ ] Lists scroll smoothly
- [ ] Modals display correctly

### Step 26: Loading States
- [ ] Loading indicators appear when needed
- [ ] Loading states are clear and not confusing
- [ ] App doesn't freeze during loading

---

## 📊 What Group 3 Needs to Document

### Test Results Summary
- [ ] **Total tests completed:** _____ / 26
- [ ] **Tests passed:** _____
- [ ] **Tests failed:** _____
- [ ] **Critical bugs found:** _____
- [ ] **Minor issues found:** _____

### Bugs Found
For each bug found, document:
- [ ] **Bug description:** What happened?
- [ ] **Steps to reproduce:** How to make it happen again?
- [ ] **Expected behavior:** What should happen?
- [ ] **Actual behavior:** What actually happened?
- [ ] **Screenshots/videos:** Visual evidence (if applicable)
- [ ] **Device/OS:** What device were you using?
- [ ] **Severity:** Critical / High / Medium / Low

### Test Environment Details
- [ ] **Tester name:** ________________
- [ ] **Testing date:** ________________
- [ ] **Device type:** ________________
- [ ] **OS version:** ________________
- [ ] **App version:** ________________

### Recommendations
- [ ] **What works well:** List features that work great
- [ ] **What needs improvement:** List areas that need work
- [ ] **Priority fixes:** List most important bugs to fix first

---

## ✅ Final Checklist

Before submitting test results:
- [ ] All test steps completed
- [ ] All bugs documented with details
- [ ] Screenshots/videos attached (if applicable)
- [ ] Test summary filled out
- [ ] Recommendations provided

---

## 📝 Notes

Use this space for any additional observations or comments:

_________________________________________________________
_________________________________________________________
_________________________________________________________

---

**Remember:** Be thorough, but don't worry if you find bugs - that's what testing is for! Document everything clearly so the team can fix issues quickly.

