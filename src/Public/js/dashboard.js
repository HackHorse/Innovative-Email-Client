document.addEventListener('DOMContentLoaded', async () => {
  const userAccessToken = localStorage.getItem('userAccessToken');
  const userEmail = localStorage.getItem('userEmail');

  if (userEmail) {
    document.getElementById('user-email-value').textContent = userEmail;
  } else {
    console.error('User email is not found in localStorage');
  }

  if (userAccessToken) {
    try {
      // Fetch emails initially on page load
      await fetchAndDisplayEmails(userAccessToken);

      // Add event listener for Sync button
      document.getElementById('sync-btn').addEventListener('click', async () => {
        try {
          const syncResponse = await axios.post('/api/emails/sync', null, {
            headers: {
              'Authorization': `Bearer ${userAccessToken}`
            }
          });

          if (syncResponse.status === 200) {
            console.log('Sync successful');
            await fetchAndDisplayEmails(userAccessToken); // Fetch and display updated emails after sync
          } else {
            console.error('Sync failed:', syncResponse.statusText);
          }
        } catch (error) {
          console.error('Error syncing emails:', error.message);
        }
      });

    } catch (error) {
      console.error('Error fetching emails:', error.message);
    }
  } else {
    console.error('User is not authenticated');
  }
});

async function fetchAndDisplayEmails(userAccessToken) {
  try {
    const response = await axios.get('/api/emails', {
      headers: {
        'Authorization': `Bearer ${userAccessToken}`
      }
    });

    if (response.status === 200) {
      const emails = response.data;
      displayEmailList(emails);
    } else {
      console.error('Failed to fetch emails:', response.statusText);
    }
  } catch (error) {
    console.error('Error fetching emails:', error.message);
  }
}

function displayEmailList(emails) {
  const emailList = document.getElementById('email-list');
  emailList.innerHTML = ''; // Clear existing emails

  emails.forEach(email => {
    const li = document.createElement('li');
    li.className = "p-4 cursor-pointer hover:bg-gray-100";
    li.innerHTML = `
      <div class="font-bold">${email.subject}</div>
      <div class="text-sm text-gray-600">${email.snippet ? email.snippet : email.content.substring(0, 100) + '...'}</div>
    `;
    li.addEventListener('click', () => {
      displayEmailContent(email);
    });
    emailList.appendChild(li);
  });
}

function displayEmailContent(email) {
  const emailContent = document.getElementById('email-content');
  emailContent.innerHTML = `
    <h3 class="text-xl font-bold mb-2">${email.subject}</h3>
    <p class="text-gray-600 mb-4">From: ${email.sender}</p>
    <div class="whitespace-pre-line">${email.content}</div>
  `;
}