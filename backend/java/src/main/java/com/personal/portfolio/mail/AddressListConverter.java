package com.personal.portfolio.mail;

import module java.base;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
class AddressListConverter implements AttributeConverter<List<String>, String> {

    @Override
    public String convertToDatabaseColumn(List<String> addresses) {
        return String.join(",", addresses);
    }

    @Override
    public List<String> convertToEntityAttribute(String column) {
        return column.isEmpty() ? List.of() : List.of(column.split(","));
    }
}
