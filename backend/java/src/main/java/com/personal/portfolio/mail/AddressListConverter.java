package com.personal.portfolio.mail;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.List;
import java.util.regex.Pattern;

@Converter
class AddressListConverter implements AttributeConverter<List<String>, String> {

    private static final String SEPARATOR = ",";
    private static final Pattern SPLITTER = Pattern.compile(SEPARATOR);

    @Override
    public String convertToDatabaseColumn(List<String> addresses) {
        return String.join(SEPARATOR, addresses);
    }

    @Override
    public List<String> convertToEntityAttribute(String column) {
        return column.isEmpty() ? List.of() : SPLITTER.splitAsStream(column).toList();
    }
}
