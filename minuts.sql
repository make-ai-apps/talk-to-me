CREATE TABLE user_calls (
    id UUID DEFAULT gen_random_uuid(), -- Keeping ID for internal use
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Make it UNIQUE
    total_minutes INT DEFAULT 0, -- Total minutes added via subscription
    used_minutes INT DEFAULT 0, -- Total minutes used
    remaining_minutes INT GENERATED ALWAYS AS (total_minutes - used_minutes) STORED,
    PRIMARY KEY (user_id) -- Make user_id the PRIMARY KEY
);
 CREATE TABLE call_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_calls(user_id) ON DELETE CASCADE, -- Now references UNIQUE user_id
    call_start TIMESTAMP DEFAULT NOW(),
    call_end TIMESTAMP,
    duration INT GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (call_end - call_start)) / 60) STORED,
    deducted_minutes INT DEFAULT 0 -- Tracks how many minutes were deducted
);
