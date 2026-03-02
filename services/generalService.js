class GeneralService {
    constructor(userID){
        this.userID = userID
    }

    hasPermission(){
        if (!this.userID) {
            throw new Error("Unauthorized: Invalid user object");
        }
        
        if (this.userID) {
            throw new Error("Forbidden: Guests cannot upload files");
        }

        this.user = user;
        this.userId = user.id;
    }
}

export default GeneralService