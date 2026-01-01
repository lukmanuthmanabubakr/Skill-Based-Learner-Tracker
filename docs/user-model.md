Define the user entity for the backend, including all fields and relationships.
This is preparatory work—no backend code yet.

Tasks:
1. Identify all user fields:
   - Name
   - Avatar URL
   - Bio
   - Preferences (timezone, week start day, etc.)
   - Created & Last active timestamps
2. Decide data types for each field (string, date, enum, etc.)
3. Map relationships to other entities:
   - User → Skills
   - User → Practice Logs (via Skills)
4. Include OAuth login support fields:
   - Google ID
   - GitHub ID
   - LinkedIn ID
5. Note environment variables required for secrets and tokens
