# Personal Life OS - Entity Relationship Diagram

```mermaid
erDiagram
    PROFILES ||--o{ SUBJECTS : "creates"
    PROFILES ||--o{ STUDY_SESSIONS : "records"
    PROFILES ||--o{ SALAH_RECORDS : "logs"
    PROFILES ||--o{ TASKS : "manages"
    PROFILES ||--o{ TRANSACTIONS : "makes"
    PROFILES ||--o{ GOALS : "sets"
    
    SUBJECTS ||--o{ CHAPTERS : "contains"
    SUBJECTS ||--o{ NOTES : "has"
    SUBJECTS ||--o{ STUDY_SESSIONS : "associated_with"

    CHAPTERS ||--|| CHAPTER_PROGRESS : "tracks via"
    
    PROFILES {
        uuid id PK
        string email
        int xp_points
        int current_level
    }

    SUBJECTS {
        uuid id PK
        uuid user_id FK
        string name
    }

    CHAPTERS {
        uuid id PK
        uuid subject_id FK
        string name
    }

    CHAPTER_PROGRESS {
        uuid id PK
        uuid chapter_id FK
        boolean class_done
        boolean model_test
        numeric progress_percentage
    }
```

The database follows a distinct Star Schema pattern centered on the `PROFILES` table, mapping 1:1 to Supabase Auth (`auth.users`).

- **Aggregations**: `CHAPTER_PROGRESS` is automatically generated continuously through a defined `GENERATED ALWAYS AS` computed column to save complex client-side calculations and prevent drift.
- **Security**: Because all tables maintain a direct `user_id` Foreign Key to `PROFILES`, Supabase RLS is simply defined as `USING (auth.uid() = user_id)` across the board.
