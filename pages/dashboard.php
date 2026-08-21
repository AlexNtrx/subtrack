<div class="container">
    <!-- 1. Header Component -->
    <?php include __DIR__ . '/../components/header.php'; ?>

    <!-- 2. Stats Component -->
    <?php include __DIR__ . '/../components/stats.php'; ?>

    <!-- 3. Controls Component (Filters & Search) -->
    <?php include __DIR__ . '/../components/controls.php'; ?>

    <!-- 4. Subscriptions Grid Container -->
    <div class="subscriptions-grid" id="subscriptionsContainer">
        <!-- Javascript renders cards dynamically here -->
    </div>
</div>

<!-- 5. Modal Component -->
<?php include __DIR__ . '/../components/modal.php'; ?>
