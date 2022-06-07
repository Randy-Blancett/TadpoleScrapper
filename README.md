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
5) inspect the headers of one interaction this seems to need to be a request that returns JSON
6) look for the request header and find the **Cookie:**

Notes: The authkey will likely have " in it these will need to be escaped when placed in the json (\\") . In the examples I have seen there is 2 " one in the middle of the string and one as the last charactor both must be escaped.

# Options
```
Options:
      --help       Show help                                           [boolean]
      --version    Show version number                                 [boolean]
  -o, --outputDir  Location where images should be stored.   [string] [required]
  -l, --logLevel   The level of logging to output
  [choices: "none", "error", "standard", "info", "debug", "trace"] [default: "st
                                                                        andard"]
  -s, --startDate  Date to start scrapping pictures (first of a given month)
                                  [string] [default: "2022-06-07T22:34:29.049Z"]
  -e, --endDate    Date to end scrapping pictures (first of a given month)
                                                        [string] [default: null]
  -y, --year       Split photos by Year                [boolean] [default: true]
  -m, --month      Split photos by Year/Month         [boolean] [default: false]
  -n, --none       All Photos will go in the same folder
                                                      [boolean] [default: false]
```