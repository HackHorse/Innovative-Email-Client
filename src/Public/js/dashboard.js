document.addEventListener("DOMContentLoaded", async () => {
  const userAccessToken = localStorage.getItem("userAccessToken");
  const userEmail = localStorage.getItem("userEmail");
  let nextPageLink = null;

  if (userEmail) {
    document.getElementById("user-email-value").textContent = userEmail;
  } else {
    console.error("User email is not found in localStorage");
  }

  if (userAccessToken) {
    try {
      // Fetch and display emails initially on page load
      await fetchAndDisplayEmails(userAccessToken);

      // Poll for new emails every few seconds
      setInterval(async () => {
        await fetchAndDisplayEmails(userAccessToken);
      }, 30000); // Polling interval: 30 seconds

      // Add event listener for Sync button (optional)
      document
        .getElementById("sync-btn")
        .addEventListener("click", async () => {
          const spinner = document.getElementById("sync-spinner");
          spinner.style.display = "inline-block"; // Show the spinner

          try {
            const syncResponse = await axios.post("/api/emails/sync", null, {
              headers: {
                Authorization: `Bearer ${userAccessToken}`,
              },
            });

            if (syncResponse.status === 200) {
              console.log("Sync successful");
              nextPageLink = null; // Reset pagination on sync
              await fetchAndDisplayEmails(userAccessToken); // Fetch and display updated emails after sync
            } else {
              console.error("Sync failed:", syncResponse.statusText);
            }
          } catch (error) {
            console.error("Error syncing emails:", error.message);
          } finally {
            spinner.style.display = "none"; // Hide the spinner
          }
        });

      // Add event listener for Load More button
      document
        .getElementById("load-more-btn")
        .addEventListener("click", async () => {
          if (nextPageLink) {
            await fetchAndDisplayEmails(userAccessToken, nextPageLink);
          }
        });
    } catch (error) {
      console.error("Error fetching emails:", error.message);
    }
  } else {
    console.error("User is not authenticated");
  }

  async function fetchAndDisplayEmails(userAccessToken, pageLink = null) {
    try {
      console.log("Fetching emails with pageLink:", pageLink);
      const response = await axios.get(pageLink || "/api/emails", {
        headers: {
          Authorization: `Bearer ${userAccessToken}`,
        },
      });

      if (response.status === 200) {
        const { emails, nextLink } = response.data;

        if (!Array.isArray(emails)) {
          throw new Error("Emails is not an array");
        }

        console.log("Fetched emails:", emails);
        console.log("Next page link:", nextLink);
        nextPageLink = nextLink; // Update nextPageLink here
        displayEmailList(emails, pageLink);
      } else {
        console.error("Failed to fetch emails:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching emails:", error.message);
      // Handle error gracefully, e.g., show a message to the user or retry logic
    }
  }

  function displayEmailList(emails, pageLink) {
    const emailList = document.getElementById("email-list");
    const noEmailsMessage = document.getElementById("no-emails-message");
    const loadMoreBtn = document.getElementById("load-more-btn");

    if (!pageLink) {
      emailList.innerHTML = ""; // Clear existing emails only if it's the first page
    }

    if (emails.length === 0 && !pageLink) {
      noEmailsMessage.classList.remove("hidden");
    } else {
      noEmailsMessage.classList.add("hidden");
      emails.forEach((email) => {
        const li = document.createElement("li");
        li.className = `p-4 cursor-pointer hover:bg-gray-100 ${
          email.isRead ? "bg-white" : "bg-yellow-100"
        }`;
        li.innerHTML = `
          <div class="font-bold">${email.subject || "No Subject"}</div>
          <div class="text-sm text-gray-600">${
            email.snippet ||
            (email.content
              ? email.content.substring(0, 100) + "..."
              : "No content available")
          }</div>
        `;
        li.addEventListener("click", () => {
          displayEmailContent(email);
        });
        emailList.appendChild(li);
      });
    }

    // Show or hide the Load More button
    if (nextPageLink) {
      loadMoreBtn.classList.remove("hidden");
    } else {
      loadMoreBtn.classList.add("hidden");
    }
  }
});

function displayEmailContent(email) {
  const emailContent = document.getElementById("email-content");
  emailContent.innerHTML = `
    <h3 class="text-xl font-bold mb-2">${email.subject || "No Subject"}</h3>
    <p class="text-gray-600 mb-4">From: ${email.sender || "Unknown"}</p>
    <div class="whitespace-pre-line">${
      email.content || "No content available"
    }</div>
  `;
}
