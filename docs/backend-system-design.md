# Zelos Backend System Design

This document translates `Zelos_Scope_Final_v5.docx` into a backend architecture for the current Next.js + MongoDB codebase.

## Goals

- Align the backend with the v5 scope as the single source of truth.
- Keep the system modular by domain.
- Separate public, authenticated, school, subscriber, mentor, and admin concerns cleanly.
- Support eventual expansion into background jobs, notifications, CDN video delivery, payments, swag, scholarships, and analytics.

## Current State vs Scope

The current backend already covers:

- JWT auth with httpOnly cookies
- role-based users
- subscriptions with grace period
- school invites
- videos with drip unlock
- forum
- events + RSVP
- admin APIs

The current backend does not yet fully match the scope in these areas:

- no explicit `visitor` handling as a first-class read-only policy layer
- no free mentee-specific profile flow and interest fields
- no parent-managed child subscriber creation workflow with generated credentials
- no school license entity or school expiry suspension logic
- no mentor application + approval flow
- no per-sub-admin permission model
- no teacher-only lesson plans / educator portal data
- no student worksheet/assigned content model beyond assigned videos
- no event cover image, update notifications, or cancellation workflow
- no notifications/email job system
- no scholarship system
- no donation system
- no swag store / gift cards / orders
- no analytics aggregation layer
- no video caption metadata or CDN tokenization layer
- no ban policy split between account access and forum-posting revocation

## Architecture

Recommended domain structure:

```text
src/
  app/api/
    auth/
    users/
    subscriptions/
    content/
    videos/
    schools/
    mentors/
    forum/
    events/
    scholarships/
    donations/
    store/
    notifications/
    admin/
  lib/
    auth/
    db/
    http/
    validation/
    policies/
    domains/
      users/
      subscriptions/
      videos/
      schools/
      mentors/
      forum/
      events/
      scholarships/
      donations/
      store/
      notifications/
      analytics/
  models/
  jobs/
  docs/
```

Design rules:

- Route handlers stay thin.
- Domain services own business rules.
- Mongoose models define persistence only.
- Policies encapsulate access decisions.
- Notification dispatch should be async-capable and event-driven.

## Identity And Roles

Final role set from scope:

- `visitor`
- `mentee`
- `subscriber`
- `child`
- `teacher`
- `student`
- `mentor`
- `sub-admin`
- `super-admin`

Implementation note:

- `visitor` does not need a persisted user record.
- `child` should remain a persisted user role tied to a parent subscriber.
- `sub-admin` should gain a permissions array rather than a single coarse role.

Recommended `User` model additions:

- `interests: string[]` for mentees
- `parentId: string | null`
- `schoolId: string | null`
- `mentorProfileId: string | null`
- `forumPostingRevoked: boolean`
- `status: "active" | "suspended" | "banned"`
- `emailVerifiedAt: Date | null`
- `lastLoginAt: Date | null`

Important policy split:

- `banned` currently blocks all access in code.
- scope says banned users keep the account but lose forum posting permanently.

Recommended change:

- reserve `status = "banned"` for full account-level bans
- use `forumPostingRevoked = true` for scope-compliant forum bans

## Authentication And Account Flows

### Public signup

- `mentee` self-signup
- `subscriber` self-signup
- no manual signup for `teacher`, `student`, `mentor`, `sub-admin`

### Subscriber flows

- adult subscriber self-signs up
- parent subscriber can create multiple `child` accounts
- child credentials are generated and sent to parent email
- child has no billing access
- age track cannot change after creation

### Invite-only flows

- teacher: admin invite only
- student: teacher invite only
- mentor: admin invite only after approval
- sub-admin: super-admin invite only

## Content Domains

Two distinct content libraries are required:

1. Individual subscriber library
2. School library

These should not share one generic video table forever without audience targeting.

Recommended content model split:

- `ContentVideo`
  - `title`
  - `description`
  - `streamUrl`
  - `captionsUrl`
  - `thumbnailUrl`
  - `audience: "subscriber" | "teacher" | "student" | "public-preview"`
  - `ageTrack: "child" | "teen" | "young-adult" | null`
  - `schoolScope: "all-schools" | "specific-schools" | null`
  - `schoolIds: string[]`
  - `category`
  - `order`
  - `dripEnabled`
  - `isPublished`
  - `attachments`

Supplementary school content:

- `Worksheet`
- `LessonPlan`
- `TeacherGuide`

## Subscriber System

Recommended `Subscription` model:

- `userId`
- `planType: "monthly" | "annual"`
- `billingStatus: "active" | "grace-period" | "suspended" | "expired"`
- `paymentStatus: "paid" | "failed"`
- `startDate`
- `expiryDate`
- `graceEndsAt`
- `renewalEligibleAt`

Rules:

- no auto-renewal
- 48-hour post-expiry buffer
- payment failure suspends dashboard immediately
- plan change only after expiration

Parent-child logic:

- child inherits parent subscription access
- parent can view child-accessible content
- deleting parent deletes child accounts

## School System

Recommended school model should include a license state:

- `name`
- `teacherLimit`
- `studentLimit`
- `teachersCount`
- `studentsCount`
- `licenseStatus: "active" | "expired" | "suspended"`
- `licenseStartsAt`
- `licenseExpiresAt`
- `assignedTracks: string[]`

Invite model:

- `email`
- `role: "teacher" | "student"`
- `schoolId`
- `token`
- `expiresAt`
- `used`
- `usedAt`
- `invitedBy`

Rules:

- invite expires in 48 hours
- admin invites teachers
- teacher invites students
- student limit includes accepted seats and optionally live pending invites
- if school license expires, all teacher/student dashboards suspend

Teacher portal capabilities needed by scope:

- invite students
- view accepted/pending students
- view student completion status
- view assigned videos
- view teacher-only training videos
- download lesson plans and guides

Student visibility rules:

- only assigned student-facing content
- worksheets only for assigned/completed lessons
- no teacher guides

## Forum System

Required final design:

- public read for visitors
- all authenticated users can post except under-16 users
- no edit/delete by users
- public shareable thread URLs
- report queue
- moderation actions by admin/sub-admin

Recommended model changes:

- `ForumThread`
  - `slug`
  - `title`
  - `content`
  - `category`
  - `authorId`
  - `isHidden`
- `ForumReply`
  - `threadId`
  - `content`
  - `authorId`
  - `isHidden`
- `ForumReport`
  - `targetType`
  - `targetId`
  - `reason`
  - `reporterId`
  - `status`
  - `resolvedBy`
  - `resolvedAt`

Needed access policy:

- under 16: read-only
- `forumPostingRevoked = true`: read-only
- visitors: read-only

## Events

Final event model should include:

- `title`
- `description`
- `coverImageUrl`
- `date`
- `location`
- `type: "online" | "physical"`
- `meetingLink`
- `status: "scheduled" | "updated" | "cancelled"`

RSVP model:

- `userId`
- `eventId`
- `createdAt`

Rules:

- public visibility for visitors
- RSVP only for authenticated users
- no RSVP cancellation
- updates/cancellation notify all RSVPs
- meeting link is emailed, never rendered publicly

## Mentor Domain

Required domain pieces not yet implemented:

- mentor application form
- admin review queue
- mentor invite
- mentor public profile
- editable profile except email
- mentor badge in forum
- mention notifications

Recommended models:

- `MentorApplication`
- `MentorProfile`

## Notifications And Email

The scope has a broad event-driven notification system. This should not live inline in route handlers forever.

Recommended design:

- `Notification` model for in-app dashboard cards
- `EmailOutbox` model for async delivery
- domain events emitted from services
- job processor consumes outbox and sends email

Suggested models:

- `Notification`
  - `userId`
  - `type`
  - `title`
  - `body`
  - `link`
  - `readAt`
- `EmailOutbox`
  - `template`
  - `recipient`
  - `payload`
  - `status`
  - `sentAt`
  - `error`

Domain events to emit:

- signup completed
- invite created
- invite accepted
- password reset requested
- subscription paid
- subscription expiring
- subscription expired
- event RSVP created
- event updated
- event cancelled
- forum reply created
- mentor-tagged post created
- ask-a-mentor thread created
- admin broadcast created
- school license expiring
- school license expired

## Payments

Subscriber billing requires a payment provider abstraction.

Recommended service boundaries:

- `BillingProvider`
  - create checkout
  - verify payment
  - store external customer id
  - update payment method

School licensing should likely be a separate billing workflow from subscriber billing.

## Swag Store

Not implemented yet. Needed models:

- `Product`
- `Order`
- `OrderItem`
- `GiftCard`

Rules:

- guest checkout
- flat shipping fee
- no returns/refunds in-platform
- gift cards apply to subscriptions and store items

## Scholarships

Not implemented yet. Needed models:

- `Scholarship`
- `ScholarshipApplication`
- `ScholarshipEscrow`
- `ScholarshipAuditLog`

Rules:

- Zelos-controlled only
- no public donations to individual scholarships
- admin can close scholarship anytime
- 5% management fee from escrow

## Donations

Not implemented yet. Needed models:

- `Donation`
- `DonationReceipt`

Rules:

- one-time only
- organization-only
- tax receipt email

## Admin System

Current code has admin APIs, but scope requires finer sub-admin permissions.

Recommended sub-admin model addition:

- `adminPermissions: string[]`

Suggested permission keys:

- `content.manage`
- `schools.manage`
- `forum.moderate`
- `events.manage`
- `users.manage-limited`
- `analytics.read`
- `billing.read`

Policy checks should move from role-only to role + permission where needed.

## Middleware And Policy Layer

Current middleware is route-prefix based. That is acceptable as a base, but business rules should primarily live in domain policies.

Recommended policy helpers:

- `requireAuth`
- `requireRole`
- `requirePermission`
- `requireForumPostingAccess`
- `requireActiveSubscription`
- `requireActiveSchoolLicense`
- `requireSchoolMembership`
- `requireTeacher`
- `requireAdmin`

## Analytics

Required analytics in scope:

- subscriber counts by plan
- active vs expired subscriptions
- video completion rates
- school seat utilization
- swag revenue
- event RSVP counts
- scholarship totals
- donation history

Recommended approach:

- start with aggregation services over MongoDB
- later materialize nightly snapshots in `AnalyticsSnapshot`

## API Design Map

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Subscriber / family

- `POST /api/subscriptions`
- `GET /api/subscriptions/status`
- `POST /api/subscribers/children`
- `GET /api/subscribers/children`
- `DELETE /api/subscribers/children/:id`

### Videos / content

- `GET /api/videos`
- `POST /api/videos/:videoId/complete`
- `GET /api/toolkit`
- `GET /api/worksheets/:id/download`

### Schools

- `POST /api/schools`
- `POST /api/schools/:schoolId/invite-teacher`
- `POST /api/schools/invite-student`
- `POST /api/schools/invite/accept`
- `GET /api/schools/:schoolId/students`
- `GET /api/schools/:schoolId/progress`

### Forum

- `GET /api/forum/threads`
- `POST /api/forum/threads`
- `POST /api/forum/threads/:threadId/replies`
- `POST /api/forum/report`

### Events

- `GET /api/events`
- `POST /api/events/:eventId/rsvp`

### Mentors

- `POST /api/mentor-applications`
- `GET /api/mentors`
- `GET /api/mentors/:slug`
- `PATCH /api/mentors/me`

### Admin

- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/ban`
- `DELETE /api/admin/users/:id`
- `POST /api/admin/videos`
- `POST /api/admin/events`
- `PATCH /api/admin/events/:id`
- `POST /api/admin/broadcasts`
- `GET /api/admin/forum/reports`
- `POST /api/admin/forum/reports/:id/resolve`
- `GET /api/admin/analytics/overview`

## Recommended Build Phases

### Phase 1

- stabilize auth and user-state policies
- add parent-child subscriber flow
- add school license status
- add notifications outbox

### Phase 2

- split content into subscriber vs school libraries
- add worksheets / lesson plans / teacher guides
- add teacher portal data APIs
- add mentor application/profile system

### Phase 3

- implement scholarships
- implement donations
- implement swag + gift cards
- implement analytics dashboards

## Immediate Repo Changes Recommended

These are the highest-priority corrections to bring the current backend closer to the scope:

1. Add child subscriber creation flow for parents.
2. Add `forumPostingRevoked` instead of using only full account bans.
3. Add school license fields and suspension policy.
4. Add notification/email outbox models and emitters.
5. Expand events with update/cancel flows and RSVP email notifications.
6. Split school content into teacher-only and student-facing assets.
7. Add mentor application and profile system.
8. Add sub-admin permission granularity.

## Summary

The current backend is a strong foundation, but the v5 scope is broader than the currently implemented API surface. The main architectural pressure points are:

- family subscriber workflows
- school license lifecycle
- school-specific learning assets
- notification orchestration
- mentor workflows
- commerce and scholarship domains
- permission granularity for staff

This document should be treated as the technical blueprint for the next implementation passes.
