
# Add "Who Hasn't Voted" Display to Party Voting

## Overview
Add a feature that shows which members haven't voted yet in the party voting component. This will be visible to users who have already voted, helping encourage remaining members to participate.

## Implementation Approach

### 1. Fetch Voter Information
- Query the `party_votes` table joined with `user_profiles` to get the list of users who have already voted
- Compare against all registered users in `user_profiles` to determine who hasn't voted

### 2. Display "Pending Voters" Section
- Show this section only when:
  - The current user has already voted (in the "waiting" state)
  - Not all members have voted yet
- Display remaining members as avatar circles with initials or names
- Style consistently with the ATP/professional design theme

### 3. UI Design
- Add a subtle section below the "Vote submitted!" confirmation
- Show remaining members with a "Waiting for:" label
- Use small avatar badges with member initials
- Include a count indicator

## Component Changes

**File: `src/components/dashboard/PartyVoting.tsx`**

1. Add new state to track pending voters:
   - `pendingVoters: { id: string; display_name: string }[]`

2. Modify `checkVotingStatus()` to:
   - Fetch all user_profiles
   - Fetch user_ids from party_votes
   - Calculate who hasn't voted yet

3. Update the "hasVoted" waiting state section to include:
   - A "Waiting for:" label
   - Avatar badges for each pending voter showing their initials
   - Subtle styling that doesn't distract from the main message

## Visual Layout (After Voting)

```text
+----------------------------------+
|  [checkmark] Vote submitted!     |
|  Waiting for 3 more members      |
|                                  |
|  Still need to vote:             |
|  [K] [V] [H]  <- Avatar initials |
|  Kockum, Viktor, Hampus          |
|                                  |
|  [clock] Results appear when     |
|  everyone has voted              |
+----------------------------------+
```

## Technical Notes
- Uses existing `user_profiles` table which is already queried in other components
- Leverages the existing Supabase client and query patterns
- No database changes required - all data already exists
