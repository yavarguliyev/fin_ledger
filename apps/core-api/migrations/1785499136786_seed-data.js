export const up = pgm => {
  pgm.sql(`
    DO $$
    DECLARE
      v_user_ids          uuid[] := ARRAY[]::uuid[];
      v_ledger_ids        uuid[] := ARRAY[]::uuid[];
      v_wallet_ids        uuid[] := ARRAY[]::uuid[];
      v_entry_ids         uuid[] := ARRAY[]::uuid[];
      v_method_ids        uuid[] := ARRAY[]::uuid[];
      v_user_id           uuid;
      v_ledger_id         uuid;
      v_wallet_id         uuid;
      v_entry_id          uuid;
      v_method_id         uuid;
      v_txn_id            uuid;
      v_available_balance bigint;
      i                   integer;
      roles               text[] := ARRAY['global admin','admin','moderator','user','user','user','user','user','user','user',
                                          'user','user','user','user','user','user','user','user','user','user',
                                          'user','user','user','user','user','user','user','user','user','user'];
      display_names       text[] := ARRAY[
        'Global Admin','Admin User','Moderator','Alice Johnson','Bob Smith',
        'Charlie Brown','Diana Prince','Ethan Hunt','Fiona Green','George Wilson',
        'Hannah Lee','Ian Black','Julia Martinez','Kevin Chen','Laura Davis',
        'Michael Brown','Nina Rodriguez','Oliver Taylor','Patricia White','Quincy Adams',
        'Rachel Green','Steve Rogers','Tina Turner','Uma Thurman','Victor Stone',
        'Wendy Williams','Xavier Woods','Yara Martinez','Zack Morris','Amy Parker'
      ];
      emails              text[] := ARRAY[
        'global_admin@example.com','admin@example.com','moderator@example.com',
        'user1@example.com','user2@example.com','user3@example.com','user4@example.com','user5@example.com',
        'user6@example.com','user7@example.com','user8@example.com','user9@example.com','user10@example.com',
        'user11@example.com','user12@example.com','user13@example.com','user14@example.com','user15@example.com',
        'user16@example.com','user17@example.com','user18@example.com','user19@example.com','user20@example.com',
        'user21@example.com','user22@example.com','user23@example.com','user24@example.com','user25@example.com',
        'user26@example.com','user27@example.com'
      ];
      bank_names          text[] := ARRAY[
        'Chase Bank','Bank of America','Wells Fargo','Citibank','Capital One',
        'Barclays','HSBC','PNC Bank','TD Bank','US Bank',
        'Chase Bank','Bank of America','Wells Fargo','Citibank','Capital One',
        'Barclays','HSBC','PNC Bank','TD Bank','US Bank',
        'Chase Bank','Bank of America','Wells Fargo','Citibank','Capital One',
        'Barclays','HSBC','PNC Bank','TD Bank','US Bank'
      ];
      pw_hash             text := '$2b$12$o88GdKR9GH6o/SPnqStlW.tqhNntaR.6bYBFech76PgWlvkMnqk2G';
      game_labels         text[] := ARRAY[
        'Premier League: Arsenal vs Chelsea','Premier League: Manchester United vs Liverpool',
        'NBA: Lakers vs Celtics','NBA: Warriors vs Nets','La Liga: Real Madrid vs Barcelona',
        'La Liga: Atletico Madrid vs Sevilla','NFL: Chiefs vs Bills','NFL: Cowboys vs Eagles',
        'UFC: Jones vs Aspinall','UFC: Adesanya vs Du Plessis','Champions League: Bayern vs PSG',
        'Champions League: Inter vs Man City','MLB: Yankees vs Red Sox','MLB: Dodgers vs Giants',
        'Tennis: Djokovic vs Alcaraz','Boxing: Fury vs Usyk','Formula 1: Monaco Grand Prix',
        'NHL: Bruins vs Maple Leafs','Serie A: Juventus vs AC Milan','Bundesliga: Dortmund vs RB Leipzig',
        'Premier League: Tottenham vs Newcastle','NBA: Heat vs Bucks','La Liga: Valencia vs Villarreal',
        'NFL: 49ers vs Packers','UFC: Makhachev vs Volkanovski','Champions League: Real Madrid vs Dortmund',
        'MLB: Cubs vs Cardinals','Tennis: Sinner vs Medvedev','Boxing: Canelo vs Charlo',
        'Formula 1: Silverstone Grand Prix'
      ];
      event_statuses      text[] := ARRAY[
        'LIVE','LIVE','LIVE','LIVE','UPCOMING','UPCOMING','UPCOMING','UPCOMING',
        'UPCOMING','UPCOMING','UPCOMING','UPCOMING','LIVE','LIVE','UPCOMING',
        'UPCOMING','UPCOMING','LIVE','UPCOMING','UPCOMING','UPCOMING','LIVE',
        'UPCOMING','UPCOMING','UPCOMING','UPCOMING','LIVE','UPCOMING','UPCOMING','UPCOMING'
      ];
      payment_types       text[] := ARRAY['DEPOSIT','WITHDRAWAL','DEPOSIT','DEPOSIT','WITHDRAWAL',
                                          'DEPOSIT','DEPOSIT','DEPOSIT','WITHDRAWAL','DEPOSIT',
                                          'DEPOSIT','WITHDRAWAL','DEPOSIT','DEPOSIT','WITHDRAWAL',
                                          'DEPOSIT','DEPOSIT','DEPOSIT','WITHDRAWAL','DEPOSIT',
                                          'DEPOSIT','WITHDRAWAL','DEPOSIT','DEPOSIT','WITHDRAWAL',
                                          'DEPOSIT','DEPOSIT','DEPOSIT','WITHDRAWAL','DEPOSIT'];
      payment_statuses    text[] := ARRAY['COMPLETED','COMPLETED','COMPLETED','PENDING','FAILED',
                                          'COMPLETED','COMPLETED','PENDING','COMPLETED','COMPLETED',
                                          'COMPLETED','FAILED','COMPLETED','COMPLETED','PENDING',
                                          'COMPLETED','COMPLETED','COMPLETED','PENDING','COMPLETED',
                                          'COMPLETED','COMPLETED','FAILED','COMPLETED','COMPLETED',
                                          'COMPLETED','COMPLETED','PENDING','COMPLETED','COMPLETED'];
      notif_types         text[] := ARRAY['PAYMENT','BET','SYSTEM','PAYMENT','WINNING',
                                          'SYSTEM','BET','PAYMENT','WINNING','SYSTEM',
                                          'PAYMENT','BET','SYSTEM','PAYMENT','WINNING',
                                          'SYSTEM','BET','PAYMENT','WINNING','SYSTEM',
                                          'PAYMENT','BET','SYSTEM','PAYMENT','WINNING',
                                          'SYSTEM','BET','PAYMENT','WINNING','SYSTEM'];
      notif_statuses      text[] := ARRAY['READ','SENT','PENDING','READ','SENT',
                                          'FAILED','READ','SENT','PENDING','READ',
                                          'SENT','READ','PENDING','SENT','READ',
                                          'FAILED','SENT','READ','PENDING','SENT',
                                          'READ','SENT','PENDING','READ','SENT',
                                          'FAILED','READ','SENT','PENDING','READ'];
      outbox_statuses     text[] := ARRAY['PUBLISHED','PUBLISHED','PENDING','FAILED','PUBLISHED',
                                          'PUBLISHED','PENDING','PUBLISHED','FAILED','PUBLISHED',
                                          'PUBLISHED','PENDING','PUBLISHED','PUBLISHED','FAILED',
                                          'PUBLISHED','PENDING','PUBLISHED','PUBLISHED','PENDING',
                                          'PUBLISHED','FAILED','PUBLISHED','PENDING','PUBLISHED',
                                          'PUBLISHED','PENDING','PUBLISHED','FAILED','PUBLISHED'];
      wt_types            text[] := ARRAY['DEPOSIT','BET','WINNING','WITHDRAWAL','DEPOSIT',
                                          'BET','WINNING','DEPOSIT','WITHDRAWAL','BET',
                                          'DEPOSIT','WINNING','BET','DEPOSIT','WITHDRAWAL',
                                          'BET','WINNING','DEPOSIT','BET','WITHDRAWAL',
                                          'DEPOSIT','WINNING','BET','DEPOSIT','WITHDRAWAL',
                                          'BET','WINNING','DEPOSIT','BET','WITHDRAWAL'];
      wt_statuses         text[] := ARRAY['COMPLETED','COMPLETED','COMPLETED','COMPLETED','PENDING',
                                          'COMPLETED','COMPLETED','FAILED','COMPLETED','COMPLETED',
                                          'COMPLETED','COMPLETED','PENDING','COMPLETED','COMPLETED',
                                          'COMPLETED','FAILED','COMPLETED','COMPLETED','PENDING',
                                          'COMPLETED','COMPLETED','COMPLETED','COMPLETED','FAILED',
                                          'COMPLETED','COMPLETED','PENDING','COMPLETED','COMPLETED'];
    BEGIN
      ------------------------------------------------------------------
      -- 1. USERS (30)
      ------------------------------------------------------------------
      FOR i IN 1..30 LOOP
        INSERT INTO users (email, display_name, password_hash, role, profile_images_key, profile_images, profile_image_index, is_email_verified)
        VALUES (
          emails[i], 
          display_names[i], 
          pw_hash, 
          roles[i], 
          NULL,
          '[]'::jsonb,
          0,
          true
        )
        ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name
        RETURNING id INTO v_user_id;
        v_user_ids := array_append(v_user_ids, v_user_id);
      END LOOP;

      ------------------------------------------------------------------
      -- 2. LEDGER_ACCOUNTS (30) + back-fill users.ledger_account_id
      ------------------------------------------------------------------
      FOR i IN 1..30 LOOP
        INSERT INTO ledger_accounts (user_id, account_type, currency, balance_minor)
        VALUES (
          v_user_ids[i],
          'LIABILITY',
          'USD',
          0
        )
        RETURNING id INTO v_ledger_id;
        v_ledger_ids := array_append(v_ledger_ids, v_ledger_id);

        UPDATE users
        SET ledger_account_id = v_ledger_id
        WHERE id = v_user_ids[i];
      END LOOP;

      ------------------------------------------------------------------
      -- 3. WALLETS (30) + back-fill users.wallet_id
      ------------------------------------------------------------------
      FOR i IN 1..30 LOOP
        -- Admin roles (first 3 users) get 0 balance, regular users get random balance
        IF i <= 3 THEN
          v_available_balance := 0;
        ELSE
          v_available_balance := (50000 + (random() * 450000))::bigint;
        END IF;

        INSERT INTO wallets (
          user_id, ledger_account_id, currency,
          available_balance_minor, reserved_balance_minor, version, status
        )
        VALUES (
          v_user_ids[i],
          v_ledger_ids[i],
          'USD',
          v_available_balance,
          0,
          1,
          'ACTIVE'
        )
        RETURNING id INTO v_wallet_id;
        v_wallet_ids := array_append(v_wallet_ids, v_wallet_id);

        UPDATE ledger_accounts
        SET balance_minor = v_available_balance
        WHERE id = v_ledger_ids[i];

        UPDATE users
        SET wallet_id = v_wallet_id
        WHERE id = v_user_ids[i];
      END LOOP;

      ------------------------------------------------------------------
      -- 4. PAYMENT_METHODS (27 - only for 'user' role, skip admins)
      ------------------------------------------------------------------
      FOR i IN 4..30 LOOP
        INSERT INTO payment_methods (
          user_id, type, account_holder, masked_account, bank_name, status, is_default
        )
        VALUES (
          v_user_ids[i],
          CASE WHEN i % 2 = 0 THEN 'BANK_ACCOUNT'::payment_method_type ELSE 'DEBIT_CARD'::payment_method_type END,
          display_names[i],
          CASE WHEN i % 2 = 0 THEN '****' || (1000 + i) ELSE '****' || (4000 + i) END,
          bank_names[i],
          'VERIFIED'::payment_method_status,
          true
        )
        RETURNING id INTO v_method_id;
        v_method_ids := array_append(v_method_ids, v_method_id);
      END LOOP;

      ------------------------------------------------------------------
      -- 5. LEDGER_ENTRIES (30)
      ------------------------------------------------------------------
      FOR i IN 1..30 LOOP
        v_txn_id := uuid_generate_v7();
        INSERT INTO ledger_entries (
          transaction_id, account_id, entry_type, amount_minor,
          currency, description, reference, sequence, created_at
        )
        VALUES (
          v_txn_id,
          v_ledger_ids[i],
          CASE WHEN i % 2 = 0 THEN 'DEBIT'::entry_type ELSE 'CREDIT'::entry_type END,
          (1000 + (random() * 49000))::bigint,
          'USD',
          CASE
            WHEN i % 3 = 0 THEN 'Bet placed'
            WHEN i % 3 = 1 THEN 'Deposit'
            ELSE 'Winning payout'
          END,
          'REF-' || i,
          1,
          CURRENT_TIMESTAMP - ((i * 2) || ' hours')::interval
        )
        RETURNING id INTO v_entry_id;
        v_entry_ids := array_append(v_entry_ids, v_entry_id);
      END LOOP;

      ------------------------------------------------------------------
      -- 6. WALLET_TRANSACTIONS (27 - only for 'user' role, skip admins)
      ------------------------------------------------------------------
      FOR i IN 4..30 LOOP
        INSERT INTO wallet_transactions (
          wallet_id, type, amount_minor, currency, status,
          reference, transaction_id, ledger_entry_id, created_at
        )
        VALUES (
          v_wallet_ids[i],
          wt_types[i],
          (1000 + (random() * 49000))::bigint,
          'USD',
          wt_statuses[i],
          wt_types[i] || '-' || i,
          'TXN-' || uuid_generate_v7()::text,
          v_entry_ids[i],
          CURRENT_TIMESTAMP - ((i * 2) || ' hours')::interval
        );
      END LOOP;

      ------------------------------------------------------------------
      -- 7. PAYMENTS (27 - only for 'user' role, skip admins)
      ------------------------------------------------------------------
      FOR i IN 4..30 LOOP
        INSERT INTO payments (
          idempotency_key, user_id, wallet_id, ledger_account_id, payment_method_id,
          type, amount_minor, currency, status,
          transaction_id, metadata, created_at
        )
        VALUES (
          'idem-' || i || '-' || uuid_generate_v7()::text,
          v_user_ids[i],
          v_wallet_ids[i],
          v_ledger_ids[i],
          v_method_ids[i],
          payment_types[i],
          (5000 + (random() * 95000))::bigint,
          'USD',
          payment_statuses[i]::payment_status,
          'pay-txn-' || i,
          jsonb_build_object('source', 'seed', 'index', i),
          CURRENT_TIMESTAMP - ((i * 3) || ' hours')::interval
        );
      END LOOP;

      ------------------------------------------------------------------
      -- 8. NOTIFICATIONS (30 - all users including admins can have notifications)
      ------------------------------------------------------------------
      FOR i IN 1..30 LOOP
        INSERT INTO notifications (user_id, type, title, content, status, created_at)
        VALUES (
          v_user_ids[i],
          notif_types[i],
          notif_types[i] || ' notification #' || i,
          'This is a seeded notification of type ' || notif_types[i] || ' for user ' || i,
          notif_statuses[i]::notification_status,
          CURRENT_TIMESTAMP - ((i) || ' hours')::interval
        );
      END LOOP;

      ------------------------------------------------------------------
      -- 9. OUTBOX_EVENTS (30 - all users)
      ------------------------------------------------------------------
      FOR i IN 1..30 LOOP
        INSERT INTO outbox_events (
          aggregate_type, aggregate_id, event_type, payload, status, created_at, published_at
        )
        VALUES (
          CASE WHEN i % 3 = 0 THEN 'Payment' WHEN i % 3 = 1 THEN 'Wallet' ELSE 'User' END,
          v_user_ids[i],
          CASE WHEN i % 3 = 0 THEN 'PaymentCompleted' WHEN i % 3 = 1 THEN 'BalanceUpdated' ELSE 'UserRegistered' END,
          jsonb_build_object('userId', v_user_ids[i], 'index', i, 'seed', true),
          outbox_statuses[i]::outbox_status,
          CURRENT_TIMESTAMP - ((i) || ' hours')::interval,
          CASE WHEN outbox_statuses[i] = 'PUBLISHED'
               THEN CURRENT_TIMESTAMP - ((i - 1) || ' hours')::interval
               ELSE NULL END
        );
      END LOOP;

      ------------------------------------------------------------------
      -- 10. GAME_EVENTS (30)
      ------------------------------------------------------------------
      FOR i IN 1..30 LOOP
        INSERT INTO game_events (label, odds, status, created_at)
        VALUES (
          game_labels[i],
          (1.20 + (random() * 3.80))::numeric(10,2),
          event_statuses[i]::event_status,
          CURRENT_TIMESTAMP - ((30 - i) || ' days')::interval
        );
      END LOOP;

    END $$;
  `);
};

export const down = pgm => {
  pgm.sql(`
    DELETE FROM game_events;
    DELETE FROM outbox_events;
    DELETE FROM notifications;
    DELETE FROM payments;
    DELETE FROM payment_methods;
    DELETE FROM wallet_transactions;
    DELETE FROM wallet_currency_conversions;
    DELETE FROM ledger_entries;
    DELETE FROM wallets;
    DELETE FROM ledger_accounts;
    DELETE FROM users;
  `);
};
