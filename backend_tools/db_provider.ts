import {
  doc,
  Firestore,
  getFirestore,
  setDoc,
  updateDoc,
  addDoc,
  getDoc,
  DocumentData,
  Query,
  where,
  getDocs,
  QueryDocumentSnapshot,
  QuerySnapshot,
  deleteDoc,
  collection,
  arrayUnion,
  query,
} from 'firebase/firestore';
import Club from '../models/club';
import User from '../models/user';
import FirebaseApp from './firebase';
import Event from '../models/event';

class DbProvider {
  db: Firestore = getFirestore(FirebaseApp);
  userPath: string = 'Users';
  clubPath: string = 'Clubs';
  eventPath: string = 'Events';
  async createUser(user: User): Promise<string | undefined> {
    try {
      const userCollection = collection(this.db, this.userPath);
      const ref = await addDoc(userCollection, user);
      return ref.id;
    } catch (error) {
      console.error(`failure saving user, got error: ${error}`);
      return undefined;
    }
  }

  async createClub(club: Club): Promise<string | undefined> {
    try {
      const docu = doc(this.db, this.clubPath, club.name);

      await setDoc(docu, club);

      return club.name;
    } catch (error) {
      console.error(`failure saving club, got error: ${error}`);
      return undefined;
    }
  }

  async getUser(userid: string): Promise<User | undefined> {
    const userReference = doc(this.db, this.userPath, userid);
    const ref = await getDoc<DocumentData>(userReference);
    return ref.data() as User;
  }

  async getClubById(id: string): Promise<Club> {
    const clubReference = doc(this.db, this.clubPath, id);
    const ref = await getDoc<DocumentData>(clubReference);
    return {
      ...(ref.data() as Club),
      id: ref.id,
    };
  }

  async getAllClubs(): Promise<Club[] | null> {
    const clubRef = collection(this.db, this.clubPath);
    const q = query(clubRef);
    const snapshot = await getDocs(q);
    try {
      const documentList: Club[] = snapshot.docs.map((doc) => {
        return {
          ...(doc.data() as Club),
          id: doc.id,
        };
      });
      return documentList;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getClubsByName(name: string): Promise<Club[]> {
    const clubRef = collection(this.db, this.clubPath);

    // Split the name into words, capitalize the first letter of each word, and join them back together
    const splitName = name.split(' ');
    const titleCaseName = splitName.map(
      (word) => word[0].toUpperCase() + word.slice(1).toLowerCase(),
    );
    const capitalizedName = titleCaseName.join(' ');

    const q: Query<DocumentData> = query(
      clubRef,
      where('name', '>=', capitalizedName),
      where('name', '<=', capitalizedName + '\uf8ff'),
    );

    const snapshot = await getDocs(q);
    const clubs = snapshot.docs.map((club) => ({
      ...(club.data() as Club),
      id: club.id,
    }));
    return clubs;
  }

  async deleteClub(club_name: string): Promise<boolean> {
    const docRef = doc(this.db, this.clubPath, club_name);
    await deleteDoc(docRef);
    return true;
  }

  async deleteUser(user: string) {
    throw new Error('not implemented');
  }

  private async createEvent(event: Event) {
    //this function is a bit more tricky, we need to update that this club has an event
    //and we need to create the event in our db
    //save event into db
    const eventsCollection = collection(this.db, this.eventPath);
    const eventRef = addDoc(eventsCollection, event);

    //update club
    const club = doc(this.db, this.clubPath, event.hostclub);
    await updateDoc(club, {
      events: arrayUnion(eventRef),
    });
  }

  private async deleteEvent(eventId: string) {
    const docRef = doc(this.db, this.eventPath, eventId);
    await deleteDoc(docRef);
  }

  private async getEventRefsFromClub(clubName: string) {
    throw new Error('Unfinished');

    const club = await this.getClubById(clubName);
    return club.events;
  }
}
export default DbProvider;
