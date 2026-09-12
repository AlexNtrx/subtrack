
const SubTrackerAPI = {
//   Haetaan kaikki Subscriptionit (GET)
    async getAll() {
        try {
            const response = await fetch('handlers/get_subscriptions.php');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Virhe haettaessa tilauksia (Fetch all failed):', error);
            throw error;
        }
    },

    // luodaan uusi Subscription (POST)

    async create(data) {
        try {
            const response = await fetch('handlers/add_subscription.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Virhe luotaessa tilausta (Create failed):', error);
            throw error;
        }
    },

//    päivitetään olemassa oleva Subscription (POST)
    async update(id, data) {
        try {
            const response = await fetch('handlers/update_subscription.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...data })
            });
            return await response.json();
        } catch (error) {
            console.error('Virhe päivitettäessä tilausta (Update failed):', error);
            throw error;
        }
    },

    // poistetaan Subscription (POST)
    async delete(id) {
        try {
            const response = await fetch('handlers/delete_subscription.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            return await response.json();
        } catch (error) {
            console.error('Virhe poistettaessa tilausta (Delete failed):', error);
            throw error;
        }
    },

//    vaihdetaan Subscriptionin tila (POST)
    async toggleStatus(id) {
        try {
            const response = await fetch('handlers/toggle_status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            return await response.json();
        } catch (error) {
            console.error('Virhe vaihdettaessa tilaa (Toggle status failed):', error);
            throw error;
        }
    }
};
