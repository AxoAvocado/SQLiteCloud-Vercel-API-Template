// Import express and cors for API, dotenv for environment variables and SQLiteCloud drivers
const cors = require("cors")
const env = require("dotenv");
const { Database } = require("@sqlitecloud/drivers");

// Load environment variables
env.config();

// Create express app
const app = express();

// Use JSON and cors middleware for handling json objects and cross-site
// requests in order to prevent cross-origin browser errors
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Create a connection to the database
const db = new Database(process.env.SQLITECLOUD_DATABASE_URL)

// Send a command to the database
//
// Make sure to follow the syntax:
// SELECT * FROM DB_NAME WHERE KEY = ?
// 
// Otherwise, it won't work and/or your database 
// will be vulnerable to sql injection attacks
async function commandToDB(args) {
    try {
        const query = "ADD YOUR QUERY HERE LIKE THIS: SELECT * FROM db where key = ?";
        // Args should be an array with the size of how many hidden values (?) are in the query
        const result = await db.run(query, args);
        // Add your post-query code here, in this case we will return the response.
        return result
    } catch (err) {
        console.error("Error eliminando mensaje de la base de datos:", err);
        throw err;
    }
}

// Forbidden sources error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong.");
});

// API Routing
app.post("/your/api/route/goes/here", async (req, res) => {
    // The body of the request is a json object
    // For example: { "msg": "key1=value1&key2=value2" }
    const body = req.body;
    // Split the request body into an array.
    // For example: ["key1=value1", "key2=value2"]
    // 
    // Change "query" to whatever is in your request body, as it will be accessed as a json object
    // --------------------------------------------------
    // variable name to access the command
    //    \/
    // { "query": "key1=value1&key2=value2" }
    const queryParams = body.query.split('&');
    const params = {};
    // Split the array into key/value pairs and save it to the params object.
    queryParams.forEach(param => {
        const [key, value] = param.split('=');
        params[key] = value;
    });
    // Create variables to access params values
    const { cmd, args } = params;  

    try {
        switch(cmd) {
            // Add more cases to handle different commands
            case "command":
                const result = await commandToDB(args);
                res.send(result);
                break;
            default:
                res.status(404).send("Not found.");
                break;
        }
    } catch (err) {
        console.error(err);
        res.status(404).send("Not found.");
    }
});

// Health check
app.get("/", (req, res) => {
    // We'll send a message to the user
    res.send("SQLiteCloud API Vercel Template");
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server ready on port ${port}.`));
