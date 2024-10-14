import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d3d3d3',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#edf1f2',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  searchBar: {
    margin: 10,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  patientContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    marginVertical: 5,
    marginHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  infoContainer: {
      flex:1,
    },
  patientName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  patientInfo: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  patientPhoto: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: 15,
    },
  arrowContainer: {
    justifyContent: 'center',
  },
  arrow: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  archivoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  archivoInfo: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  deleteIcon: {
    marginLeft: 10,
  },
  downloadIcon: {
    marginLeft: 20,
  },
});
