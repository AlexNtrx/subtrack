<div class="container">
    <!--  Header Component -->
    <?php include __DIR__ . '/../components/header.php'; ?>

    <!--  Stats Component -->
    <?php include __DIR__ . '/../components/stats.php'; ?>

    <!--  Controls Component (Filters & Search) -->
    <?php include __DIR__ . '/../components/controls.php'; ?>

    <!--  Subscriptions Grid Container -->
    <div class="subscriptions-grid" id="subscriptionsContainer">
        <!-- Javascript renders cards dynamically here -->
    </div>
</div>

<!--  Modal Component -->
<?php include __DIR__ . '/../components/modal.php'; ?>

<!--  Toast Notifications Container -->
<div id="toastContainer" class="toast-container" aria-live="polite"></div>

