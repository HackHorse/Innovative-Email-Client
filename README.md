# Innovative-Email-Client

Description

Fteching and syncing email from user outlook account to local system via elasticsearch.

Prerequisites

	•	Node.js 20.14.0
	•	npm
	•	Elasticsearch and Kibana
  •	Tailwind CSS
  •	Docker

Installation

1) Clone the repository:

git clone <repository-url>
cd <project-folder>

2) Install dependencies:

npm install

3) Environment variables:
PORT:3000
OUTLOOK_CLIENT_ID=<Your Microsoft Graph Client ID>
OUTLOOK_CLIENT_SECRET=<Your Microsoft Graph Client Secret>
OUTLOOK_CALLBACK_URL=<Your Microsoft Graph Callback URL>


4): Running the Server

npm start (but make sure to make "start": "NODE_OPTIONS=--max-old-space-size=4096 nodemon src/server.js")
--max-old-space-size=4096 flag to allocate sufficient memory for operations that may require it, such as Elasticsearch indexing.


Running with Docker

Using Docker Compose

Build and start containers:
docker-compose up --build


  
