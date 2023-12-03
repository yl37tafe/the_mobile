import * as React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import NetInfo from "@react-native-community/netinfo";
import { infoMessage  } from '../utils/flashMessage';

// Import helper code
import Settings from '../constants/Settings';
import { RoiGetPeople } from '../utils/RoiApi';
import { PopupOk, PopupOkCancel } from "../utils/Popup";

// Import styling and components
import { TextParagraph, TextH1, TextH2 } from "../components/StyledText";
import Styles from "../styles/MainStyle";
import { MyButton } from '../components/MyButton';
import { RoiDeletePerson } from '../utils/Api';


export default function ViewPeopleScreen(props) {

  // State - data for this component

  // Data array, default to empty array
  const [people, setPeople] = React.useState([])

  // Set "effect" to retrieve and store data - only run on mount/unmount (loaded/unloaded)
  // "effectful" code is something that triggers a UI re-render
  React.useEffect(refreshPersonList, [])

  // Refresh the person list data - call the API
  function refreshPersonList() {

    console.log("refresh person list")

    // Get data from the API
    RoiGetPeople()
      // Success
      .then(data => {
        // Store results in state variable
        setPeople(data)
      })
      // Error
      .catch(error => {
        PopupOk("API Error", "Could not get people from the server")
      })

  }

  function showAddPerson() {
    
    props.navigation.navigate('Root', {screen: "AddPerson"});

  }

  function showViewPerson(person) {
    
    props.navigation.navigate('ViewPerson', {id: person.id});

  }

  function showEditPerson(person) {
    
    props.navigation.navigate('EditPerson', {id: person.id});

  }

  function deletePerson(person){

    PopupOkCancel(

      "Delete person?",

      `Are you sure you want to delete ${person.name}?`,
      
      () => {
        RoiDeletePerson(person.id)
          .then(data => {
            PopupOk("Person deleted", `${person.name} has been deleted`)
            refreshPersonList()
          })

          .catch(error => {
            PopupOk("Error", error)
          })
      },

      () => {}

    )
  }

  function displayConnectionMessage() {
    console.log('displayConnectionMessage');
    // Get network connection status
    NetInfo.fetch().then((status) => {
      // Check if not connected to the Internet
      if (!status.isConnected) {
        // Display the flash message
        infoMessage ('No internet connection', 'You will only see cached data until you \nhave an active internet connection again');
      }
    });
  }

  // Display all people data
  function displayPeople() {

    displayConnectionMessage()

    if (!people) return
    
    // Loop through each item and turn into appropriate output and then return the result
    return people.map(p => {

      // Create an output view for each item
      return (
        <View key={p.id} style = {Styles.personListItem}>
          <View style = {Styles.personListItemDetails}>
            <TextParagraph style = {Styles.personListItemName}>{p.name}</TextParagraph>
            <TextParagraph style = {Styles.personListItemText}>{p.department ? p.department.name : "---"}</TextParagraph>
            <TextParagraph style = {Styles.personListItemText}>{p.phone}</TextParagraph>
          </View>
          <View style = {Styles.personListItemButtons}>
            <MyButton
              text="Info"
              type="major"
              size="small"
              onPress={() => {showViewPerson(p)}}
              buttonStyle={Styles.personListItemButton}
              textStyle={Styles.personListItemButtonText}
            />
            <MyButton
              text="Edit"
              type="default"
              size="small"
              onPress={() => {showEditPerson(p)}}
              buttonStyle={Styles.personListItemButton}
              textStyle={Styles.personListItemButtonText}
            />
            <MyButton
              text="Delete"
              type="minor"
              size="small" 
              onPress={() => {deletePerson(p)}}
              buttonStyle={Styles.personListItemButton}
              textStyle={Styles.personListItemButtonText}
            />
          </View>
        </View>
      )

    })
    
  }


  // Main output of the screen component
  return (
    <SafeAreaView style={Styles.safeAreaView}>
      
      <View style={Styles.personButtonContainer}>
        <MyButton 
          text="+ Add new person"
          type="major"      // default*|major|minor
          size="small"      // small|medium*|large
          onPress={showAddPerson}
        />
        <MyButton 
          text="Refresh"
          type="default"    // default*|major|minor
          size="small"      // small|medium*|large
          onPress={refreshPersonList}
        />
      </View>
      
      <ScrollView style={Styles.container} contentContainerStyle={Styles.contentContainer}>
          
        <TextH1 style={{marginTop:0}}>Listing all people</TextH1>

        <View style = {Styles.personList}>
          {displayPeople()}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}