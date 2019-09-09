const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    type Event {
        email: String!
        firstname: String!
        lastname: String!
        password: String!
    }

    type User {
        _id: ID!
        email: String!
        firstname: String!  
        lastname: String!      
        password: String!        
    }

    type Essential {
        city: String!
        date: String!
        title: String!
        likes: Int!
    }

    input UserInputData {
        email: String!
        firstname: String! 
        lastname: String!       
        password: String!
    }

    type RootQuery {
        hello: Event!        
    }

    type RootMutation {
        createUser(userInput: UserInputData): User!        
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);