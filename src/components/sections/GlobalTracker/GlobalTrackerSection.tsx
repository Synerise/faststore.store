import {useEffect} from "react";
import Cookies from 'js-cookie';

import {request} from "src/sdk/graphql/request";
import {gql} from "@generated/gql";



const UpdateOrderFormCustomDataMutation = gql(`
    mutation addOrderFormCustomData($appId: String!, $field: String!, $value: String!){
        addOrderFormCustomData(input: {appId: $appId, field: $field, value: $value})
    }
`)

const GlobalTrackerSection = () => {
    const updateSyneriseCustomApp = async (field: string, value: string) => {
        await request(UpdateOrderFormCustomDataMutation, {
            appId: 'synerise',
            field: field,
            value: value,
        })
    }

    useEffect(() => {
        const uuid = Cookies.get('_snrs_uuid');
        const snrsParams = Cookies.get('_snrs_params');

        if(uuid) updateSyneriseCustomApp('uuid', uuid);
        if(snrsParams) updateSyneriseCustomApp('snrs_params', snrsParams);
    }, []);

    return <></>
}


export default GlobalTrackerSection;
