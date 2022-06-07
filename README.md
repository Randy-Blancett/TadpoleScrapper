# TadpoleScrapper
This code will allow you to scrape Images of your child off the tadpoles webpage

# Install
1) Ensure that Node and npm are installed on your machine
2) run **npm install**
3) run **npm run fullBuild**
4) copy **config/data_example.json** to **config/data.json**
5) enter your authkey in **config/data.json**

# Run
  
    npm run start -- -o <Output Direcotry>

# Get AuthKey
1) go to tadpoles and log in
2) In Firefox hit F12 ( bring up dev console)
3) go to network
4) refresh page if there is nothing in the console
5) inspect the headers of one interaction
6) look for the request header and find the **Cookie:**

Notes: The authkey will likely have " in it these will need to be escaped when placed in the json (\\") .

